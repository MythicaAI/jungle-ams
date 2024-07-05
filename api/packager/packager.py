"""
Packager script, create zip packages from assets.

Will run in stand-alone mode from the command line
or worker mode when connected to an events table.
"""

import argparse
import asyncio
import os
import tempfile
import zipfile
from pathlib import Path
from uuid import UUID

import requests
from pydantic import AnyHttpUrl

from events.events import EventsSession
from routes.assets.assets import AssetVersionResult, AssetVersionContent
from routes.download.download import DownloadInfoResponse
from routes.responses import FileUploadResponse


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
        "-o", "--output",
        help="Output directory",
        default=os.getcwd(),
        required=False
    )

    return parser.parse_args()


def get_versions(endpoint: str, asset_id: UUID, version: tuple[int, ...]) -> list[AssetVersionResult]:
    """Get all versions for a given asset"""
    if len(version) != 3:
        raise Exception("Invalid version format, must be a 3 valued tuple")
    if version == (0, 0, 0):
        r = requests.get(f"{endpoint}/api/v1/assets/{asset_id}")
    else:
        version_str = ".".join(map(str, version))
        r = requests.get(f"{endpoint}/api/v1/assets/{asset_id}/versions/{version_str}")
    if r.status_code != 200:
        raise Exception(r.text)
    o = r.json()
    if type(o) is list:
        return sorted(map(lambda v: AssetVersionResult(**v), o), key=lambda x: x.version, reverse=True)
    else:
        return sorted([AssetVersionResult(**o)], key=lambda x: x.version, reverse=True)


def get_file_contents(v: AssetVersionResult) -> list[AssetVersionContent]:
    """Return all file contents if they exist"""
    files = v.contents.get('files')
    if files is None:
        return []
    return files


def resolve_contents(endpoint, content: AssetVersionContent) -> DownloadInfoResponse:
    """"Resolve content by ID to a resolved download URL"""
    r = requests.get(f"{endpoint}/api/v1/download/info/{content.file_id}")
    if r.status_code != 200:
        raise Exception(r.text)
    dl_info = DownloadInfoResponse(**r.json())
    assert dl_info.url is not None
    assert dl_info.file_id == content.file_id
    print(f"resolved {dl_info.name} ({dl_info.content_hash})")
    return dl_info


async def create_zip_from_asset(output_path: Path, endpoint: str, asset_id: UUID, version: tuple[int, ...]):
    """Given an output zip file name, resolve all the content of the asset_id and create a zip file"""

    versions = get_versions(endpoint, asset_id, version)
    for v in versions:
        version_str = '.'.join(map(str, v.version))
        zip_filename = output_path / f"{asset_id}-{version_str}.zip"
        print(f"creating package {zip_filename}")
        with zipfile.ZipFile(zip_filename, 'w') as zip_file:
            print(v.model_dump())
            contents = map(lambda c: resolve_contents(endpoint, c), get_file_contents(v))
            for content in contents:
                url = AnyHttpUrl(content.url)
                response = requests.get(url, stream=True)
                if response.status_code != 200:
                    raise Exception(f"Failed to download url: {url} {response.text}")
                zip_file.writestr(content.name, response.content)
            manifest = v.model_dump_json()
            zip_file.writestr("manifest.json", manifest.encode("utf-8"))

        await upload_package(endpoint, asset_id, version_str, zip_filename)


async def upload_package(endpoint: str, asset_id: UUID, version_str: str, zip_filename: Path):
    """Upload a package update to an asset from a specific zip file"""
    url = f"{endpoint}/api/v1/upload/package/{asset_id}/{version_str}"
    with open(zip_filename, 'rb') as file:
        response = requests.post(url, files={
            'files': (os.path.basename(zip_filename), file, 'application/zip')})
        if response.status_code != 200:
            print(f"package upload failed: {response.status_code}")
            print(f"response: {response.text}")
            return
        o = response.json()
        assert 'files' in o and type(o['files']) is list and len(o['files']) == 1
        file_upload = FileUploadResponse(**response.json()['files'][0])
        print((f"package uploaded for {asset_id} {version_str},"
               f" package_id: {file_upload.file_id}, content_hash: {file_upload.content_hash}"))


async def main(output_path: Path, endpoint: str, asset_id: UUID, version: tuple[int, ...]):
    """Main entrypoint when running with argument overrides (non-worker mode)"""
    await create_zip_from_asset(
        output_path,
        endpoint,
        asset_id,
        version)


async def exec_job(endpoint, job_data):
    """Given the job data from the event, create the ZIP package"""
    asset_id = job_data.get('asset_id')
    if asset_id is None:
        print("asset_id is missing from job_data")
        return
    try:
        asset_id = UUID(asset_id)
    except ValueError as e:
        print(f"asset_id is not a valid UUID: {asset_id}: {e}")
        return

    version = job_data.get('version')
    if version is None:
        print("version is missing from job_data")
        return

    assert type(version) is list or type(version) is tuple
    with tempfile.TemporaryDirectory() as tmp_dir:
        await create_zip_from_asset(Path(tmp_dir), endpoint, asset_id, version)


async def worker_entrypoint(endpoint: str):
    """Async entrypoint to test worker dequeue, looks for SQL_URL
        environment variable to form an initial connection"""
    sql_url = os.environ.get('SQL_URL', 'postgresql+asyncpg://test:test@localhost:5432/upload_pipeline')
    sleep_interval = os.environ.get('SLEEP_INTERVAL', 1)
    async with EventsSession(sql_url, sleep_interval, event_type_prefix='asset_version_updated') as session:
        async for event_id, job_data in session.ack_next():
            print("event:", event_id, job_data)
            await exec_job(endpoint, job_data)
            await session.complete(event_id)


if __name__ == '__main__':
    args = parse_args()
    if args.asset is not None:
        print("asset provided, running command line mode")
        asyncio.run(main(
            Path(args.output),
            args.endpoint,
            UUID(args.asset),
            tuple(map(int, args.version.split('.')))))
    else:
        print("no asset provided, running in event worker mode")
        asyncio.run(worker_entrypoint(args.endpoint))
