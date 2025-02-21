"""
Packager script, create zip packages from assets.

Will run in stand-alone mode from the command line
or worker mode when connected to an events table.
"""

import argparse
import asyncio
import logging
import os
import requests
import tempfile
import zipfile
from pathlib import Path
from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings
from pythonjsonlogger import jsonlogger
from ripple.automation.adapters import NatsAdapter
from ripple.automation.models import AutomationRequest, CropImageRequest
from ripple.automation.worker import process_guid
from ripple.models.params import FileParameter, ParameterSet
from typing import Optional
from uuid import uuid4

from assets.repo import AssetFileReference, AssetVersionResult
from events.events import EventsSession
from routes.download.download import DownloadInfoResponse
from routes.file_uploads import FileUploadResponse
from sanitize_filename import sanitize_filename
from telemetry_config import get_telemetry_headers

log = logging.getLogger(__name__)


class Settings(BaseSettings):
    """Core settings that come from the environment"""
    mythica_api_key: str = None
    mythica_endpoint: str = None


settings = Settings()

image_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webm'}

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
        "-p", "--profile",
        help="Profile ID to to run as or use the default in the API key",
        default=None,
        required=False
    )
    parser.add_argument(
        "-e", "--endpoint",
        help="API endpoint",
        default=settings.mythica_endpoint,
        required=False
    )

    parser.add_argument(
        "-k", "--api_key",
        help="API access key",
        default=settings.mythica_api_key,
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
        url = build_asset_url(endpoint, asset_id, version)
        r = requests.get(url)
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


def start_session(endpoint: str, api_key: str, as_profile_id: Optional[str]) -> str:
    if as_profile_id:
        headers = {"Impersonate-Profile-Id": as_profile_id}
    else:
        headers = {}
    url = f"{endpoint}/v1/sessions/key/{api_key}"
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()

    result = response.json()
    return result['token']


def is_houdini_file(content: DownloadInfoResponse) -> bool:
    extension = content.name.rpartition(".")[-1].lower()
    return extension in ('hda', 'hdalc')


async def generate_houdini_job_defs(avr: AssetVersionResult, content: DownloadInfoResponse, token: str) -> bool:
    parameter_set = ParameterSet(
        hda_file=FileParameter(file_id=content.file_id),
        src_asset_id=avr.asset_id,
        src_version=avr.version
    )

    event = AutomationRequest(
        process_guid=process_guid,
        correlation=str(uuid4()),
        auth_token=token,
        path='/mythica/generate_job_defs',
        data=parameter_set.model_dump(),
        telemetry_context=get_telemetry_headers(),
    )

    nats = NatsAdapter()
    log.info("Sent NATS houdini task. Request: %s", event.model_dump())
    await nats.post("houdini", event.model_dump())


async def crop_thumbnail(avr: AssetVersionResult, content: DownloadInfoResponse, token: str) -> bool:
    parameter_set = CropImageRequest(
        src_asset_id=avr.asset_id,
        src_version=avr.version,
        image_file=FileParameter(file_id=content.file_id),
        crop_pos_x=None,
        crop_pos_y=None,
        crop_w=320,
        crop_h=180,
    )

    event = AutomationRequest(
        process_guid=process_guid,
        correlation=str(uuid4()),
        auth_token=token,
        path='/mythica/crop_image',
        data=parameter_set.model_dump(),
        telemetry_context=get_telemetry_headers(),
    )

    nats = NatsAdapter()
    log.info("Sent NATS imagemagick task. Request: %s", event.model_dump())
    await nats.post("imagemagick", event.model_dump())



def is_image_file(content: DownloadInfoResponse) -> bool:
    extension = content.name.rpartition(".")[-1].lower()
    return extension in image_extensions


def build_asset_url(endpoint: str, asset_id: str, version: tuple[int]) -> str:
    """Build an access API access URL to a specific asset version"""
    version_str = '.'.join(map(str, version))
    return f"{endpoint}/v1/assets/{asset_id}/versions/{version_str}"


async def create_zip_from_asset(
        output_path: Path,
        endpoint: str,
        api_key: str,
        asset_id: str,
        profile_id: Optional[str],
        version: tuple[int, ...]):
    """Given an output zip file name, resolve all the content of the asset_id and create a zip file"""

    token = start_session(endpoint, api_key, profile_id)
    headers = {'Authorization': f"Bearer {token}"}

    versions = get_versions(endpoint, asset_id, version)
    for v in versions:
        if v.name is None:
            log.warning("asset does not have a name %s",
                        build_asset_url(endpoint, asset_id, v.version))
            continue
        version_str = '.'.join(map(str, v.version))
        zip_name = f"{sanitize_filename(v.name)}-{version_str}.zip"
        zip_filename = output_path / zip_name
        log.info("creating package %s with %s", zip_filename, v.model_dump())
        contents = list(map(lambda c: resolve_contents(endpoint, c), get_file_contents(v)))
        with zipfile.ZipFile(zip_filename, 'w') as zip_file:
            for content in contents:
                url = AnyHttpUrl(content.url)
                response = requests.get(url, stream=True)
                if response.status_code != 200:
                    raise ConnectionError(f"{response.status_code}: to download url: {url} {response.text}")

                zip_file.writestr(content.name, response.content)
            manifest = v.model_dump_json()
            zip_file.writestr("manifest.json", manifest.encode("utf-8"))

        await upload_package(endpoint, headers, asset_id, version_str, zip_filename)

        # Trigger job_def generation for package contents
        for content in contents:
            if is_houdini_file(content):
                await generate_houdini_job_defs(v, content, token)
            if is_image_file(content):
                await crop_thumbnail(v, content, token)


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
        profile_id: Optional[str],
        version: tuple[int, ...]):
    """Main entrypoint when running with argument overrides (non-worker mode)"""
    await create_zip_from_asset(
        output_path,
        endpoint,
        api_key,
        asset_id,
        profile_id,
        version)


async def exec_job(endpoint: str, api_key: str, job_data):
    """Given the job data from the event, create the ZIP package"""
    asset_id = job_data.get('asset_id')
    if asset_id is None:
        log.error("asset_id is missing from job_data")
        return
    profile_id = job_data.get('owner')
    if profile_id is None:
        log.error("profile_id is missing from job_data")
        return
    version = job_data.get('version')
    if version is None:
        log.error("version is missing from job_data")
        return

    assert type(version) is list or type(version) is tuple
    with tempfile.TemporaryDirectory() as tmp_dir:
        await create_zip_from_asset(Path(tmp_dir), endpoint, api_key, asset_id, profile_id, version)


async def worker_main(endpoint: str, api_key: str):
    """Async entrypoint to test worker dequeue, looks for SQL_URL
        environment variable to form an initial connection"""

    if endpoint is None:
        raise ValueError("endpoint is required as an argument or through MYTHICA_ENDPOINT")

    if api_key is None:
        raise ValueError("api_key is required as an argument or through MYTHICA_API_KEY")

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
            args.profile,
            tuple(map(int, args.version.split('.')))))
    else:
        log.info("no asset provided, running in event worker mode")
        asyncio.run(worker_main(args.endpoint, args.api_key))


if __name__ == '__main__':
    main()
