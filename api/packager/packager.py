"""
Packager script, create zip packages from assets.

Will run in stand-alone mode from the command line
or worker mode when connected to an events table.
"""

import argparse
import asyncio
import logging
import os
import tempfile
import zipfile
from pathlib import Path

import requests
from pydantic import AnyHttpUrl
from pythonjsonlogger import jsonlogger

from assets.repo import AssetFileReference, AssetVersionResult
from events.events import EventsSession
from routes.download.download import DownloadInfoResponse
from routes.file_uploads import FileUploadResponse

log = logging.getLogger(__name__)


def parse_args():
    """Parse command line arguments and provide the args structure"""
    parser = argparse.ArgumentParser(description="Packager")

    parser.add_argument(
        "-a", "--asset",
        help="Asset GUID",
        default=None,
        required=False
    )
    parser.add_argument(
        "-v", "--version",
        help="Asset Version e.g.: 1.2.3",
        default="0.0.0",
        required=False
    )

    parser.add_argument(
        "-e", "--endpoint",
        help="API endpoint",
        default="http://localhost:5555",
        required=False
    )

    parser.add_argument(
        "-k", "--api_key",
        help="API access key",
        required=False
    )

    parser.add_argument(
        "-o", "--output",
        help="Output directory",
        default=os.getcwd(),
        required=False
    )

    return parser.parse_args()


def get_versions(
        endpoint: str,
        asset_id: str,
        version: tuple[int, ...]) -> list[AssetVersionResult]:
    """Get all versions for a given asset"""
    if len(version) != 3:
        raise ValueError("Invalid version format, must be a 3 valued tuple")
    if version == (0, 0, 0):
        r = requests.get(f"{endpoint}/v1/assets/{asset_id}")
    else:
        version_str = ".".join(map(str, version))
        r = requests.get(f"{endpoint}/v1/assets/{asset_id}/versions/{version_str}")
    if r.status_code != 200:
        raise ConnectionError(r.text)
    o = r.json()
    if type(o) is list:
        return sorted(map(lambda v: AssetVersionResult(**v), o), key=lambda x: x.version, reverse=True)
    else:
        return sorted([AssetVersionResult(**o)], key=lambda x: x.version, reverse=True)


def get_file_contents(v: AssetVersionResult) -> list[AssetFileReference]:
    """Return all file contents if they exist"""
    return v.contents.get('files', [])


def resolve_contents(endpoint, file: AssetFileReference) -> DownloadInfoResponse:
    """"Resolve content by ID to a resolved download URL"""
    r = requests.get(f"{endpoint}/v1/download/info/{file.file_id}")
    if r.status_code != 200:
        raise ConnectionError(r.text)
    dl_info = DownloadInfoResponse(**r.json())
    assert dl_info.url is not None
    assert dl_info.file_id == file.file_id
    log.info("resolved %s (%s)",
             dl_info.name,
             dl_info.content_hash)
    return dl_info


def start_session(endpoint: str, api_key: str, as_profile_id: str) -> str:
    headers = {"Impersonate-Profile-Id": as_profile_id}
    url = f"{endpoint}/v1/sessions/key/{api_key}"
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    result = response.json()
    return result['token']


async def create_zip_from_asset(
        output_path: Path,
        endpoint: str,
        api_key: str,
        asset_id: str,
        version: tuple[int, ...]):
    """Given an output zip file name, resolve all the content of the asset_id and create a zip file"""

    token = start_session(endpoint, api_key)
    headers = {'Authorization': f"Bearer {token}"}

    versions = get_versions(endpoint, asset_id, version)
    for v in versions:
        version_str = '.'.join(map(str, v.version))
        zip_filename = output_path / f"{asset_id}-{version_str}.zip"
        log.info("creating package %s", zip_filename)
        with zipfile.ZipFile(zip_filename, 'w') as zip_file:
            log.info("version data: %s", v.model_dump())
            contents = map(lambda c: resolve_contents(endpoint, c), get_file_contents(v))
            for content in contents:
                url = AnyHttpUrl(content.url)
                response = requests.get(url, stream=True)
                if response.status_code != 200:
                    raise ConnectionError(f"{response.status_code}: to download url: {url} {response.text}")

                zip_file.writestr(content.name, response.content)
            manifest = v.model_dump_json()
            zip_file.writestr("manifest.json", manifest.encode("utf-8"))

        await upload_package(endpoint, headers, asset_id, version_str, zip_filename)


async def upload_package(
        endpoint: str,
        headers: dict[str, str],
        asset_id: str,
        version_str: str,
        zip_filename: Path):
    """Upload a package update to an asset from a specific zip file"""
    url = f"{endpoint}/v1/upload/package/{asset_id}/{version_str}"
    with open(zip_filename, 'rb') as file:
        response = requests.post(url, files={
            'files': (os.path.basename(zip_filename), file, 'application/zip')},
                                 headers=headers)
        if response.status_code != 200:
            log.error("package upload failed: %s", response.status_code)
            log.error("response: %s", response.text)
            return
        o = response.json()
        assert 'files' in o and type(o['files']) is list and len(o['files']) == 1
        file_upload = FileUploadResponse(**response.json()['files'][0])
        log.info("package uploaded for %s %s, package_id: %s, content_hash: %s",
                 asset_id, version_str, file_upload.file_id, file_upload.content_hash)


async def console_main(
        output_path: Path,
        endpoint: str,
        api_key: str,
        asset_id: str,
        version: tuple[int, ...]):
    """Main entrypoint when running with argument overrides (non-worker mode)"""
    await create_zip_from_asset(
        output_path,
        endpoint,
        api_key,
        asset_id,
        version)


async def exec_job(endpoint: str, api_key: str, job_data):
    """Given the job data from the event, create the ZIP package"""
    asset_id = job_data.get('asset_id')
    if asset_id is None:
        log.error("asset_id is missing from job_data")
        return
    version = job_data.get('version')
    if version is None:
        log.error("version is missing from job_data")
        return

    assert type(version) is list or type(version) is tuple
    with tempfile.TemporaryDirectory() as tmp_dir:
        await create_zip_from_asset(Path(tmp_dir), endpoint, api_key, asset_id, version)


async def worker_main(endpoint: str, api_key: str):
    """Async entrypoint to test worker dequeue, looks for SQL_URL
        environment variable to form an initial connection"""
    sql_url = os.environ.get('SQL_URL',
                             'postgresql+asyncpg://test:test@localhost:5432/upload_pipeline').strip()
    sleep_interval = os.environ.get('SLEEP_INTERVAL', 1)
    allowed_job_exceptions = (
        requests.exceptions.ConnectionError,
        ConnectionError,
        ValueError)
    async with EventsSession(sql_url, sleep_interval, event_type_prefixes=['asset_version_updated']) as session:
        async for event_seq, _, job_data in session.ack_next():
            log.info("event: %s, %s", event_seq, job_data)
            try:
                await exec_job(endpoint, api_key, job_data)
                await session.complete(event_seq)
            except allowed_job_exceptions:
                log.exception("job failed")


def setup_logging():
    """Setup a JSON console logger"""
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)

    # Create a StreamHandler for console output
    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter()
    handler.setFormatter(formatter)
    logger.addHandler(handler)


def main():
    setup_logging()
    args = parse_args()
    if args.asset is not None:
        log.info("asset provided, running command line mode")
        asyncio.run(console_main(
            Path(args.output),
            args.endpoint,
            args.api_key,
            args.asset,
            tuple(map(int, args.version.split('.')))))
    else:
        log.info("no asset provided, running in event worker mode")
        asyncio.run(worker_main(args.endpoint, args.api_key))


if __name__ == '__main__':
    main()
