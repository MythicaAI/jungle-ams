#!/usr/bin/env python3

# Grab all the latest published content from the public bucket and make it local
# to the expected directory
#
import os
import logging
from typing import Tuple, List

from google.cloud import storage

log = logging.getLogger('publish-init')


#
# Copy all publish information into the local path
#
def download_bucket_contents(
        bucket_name: str,
        bucket_sites_root: str,
        bucket_pointers_sites_root: str,
        publish_path: str):
    # Create local directory if it doesn't exist
    if not os.path.exists(publish_path):
        os.makedirs(publish_path, mode=0o755, exist_ok=True)

    # Client uses default workload credentials
    log.info('creating storage client...')
    client = storage.Client()

    log.info(f"collecting pointers from {bucket_name}:{bucket_pointers_sites_root}")
    blobs = client.list_blobs(bucket_name, prefix=bucket_pointers_sites_root)
    pointers = list()
    for blob in blobs:
        log.info(f"processing {blob.name}")

        # Get the full path to the file
        blob_path = blob.name
        if blob_path.endswith('.txt'):
            site_name = os.path.splitext(os.path.basename(blob_path))[0]
            log.info(f"getting reference from {blob_path}")
            try:
                content_hash = blob.download_as_bytes().decode("utf-8").strip()
                pointers.append((site_name, content_hash))
                log.info(f"pointer for {site_name} -> {content_hash}")
            except Exception as e:
                log.warning(f"no pointer for {site_name}: {str(e)}")

    file_count = 0
    for (site_name, content_hash) in pointers:
        strip_path = 4 # number of path elements to strip
        remote_version_path = os.path.join(bucket_sites_root, site_name, "versions", content_hash)
        local_path = os.path.join(publish_path, site_name)
        log.info(f"downloading version {remote_version_path} to {local_path}")

        for blob in client.list_blobs(bucket_name, prefix=remote_version_path):
            blob_path = blob.name
            path_parts = blob_path.split('/')[strip_path:]
            local_blob_path = os.path.join(*path_parts)
            assert not local_blob_path.startswith('.')
            local_file_path = os.path.join(local_path, local_blob_path)
            log.info(f"downloading file {blob.name} to {local_file_path}")
            assert not local_file_path.startswith('.')
            local_directory = os.path.dirname(local_file_path)
            os.makedirs(local_directory, mode=0o755, exist_ok=True)
            blob.download_to_filename(local_file_path)
            file_count += 1

    log.info(f"done, {file_count} files downloaded")


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)

    # Get the local publish path from the environment
    publish_path = os.environ.get('PUBLISH_PATH', '/publish')
    bucket_name = os.environ.get('BUCKET_NAME', 'mythica-public-web-content')
    bucket_sites_root = os.environ.get('BUCKET_SITES', 'sites')
    bucket_pointers_sites_root = os.environ.get('BUCKET_POINTERS_SITES', 'pointers_sites')

    download_bucket_contents(bucket_name, bucket_sites_root, bucket_pointers_sites_root, publish_path)