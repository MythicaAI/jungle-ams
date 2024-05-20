#!/usr/bin/env python3

# Grab all the latest published content from the public bucket and make it local
# to the expected directory
#
import os
import logging
from google.cloud import storage

log = logging.getLogger('publish-init')

#
# Copy all publish information into the local path
#
def download_bucket_contents(source_bucket: str, source_bucket_path: str, publish_path: str):
    log.info(f"downloading {source_bucket}:{source_bucket_path} to {publish_path}")

    # Create local directory if it doesn't exist
    if not os.path.exists(publish_path):
        os.makedirs(publish_path)

    # Client uses default workload credentials
    log.info('creating storage client...')
    client = storage.Client()

    # List blobs in the bucket
    log.info(f"listing files at {source_bucket_path}")
    blobs = client.list_blobs(source_bucket, prefix=source_bucket_path, delimiter='/')
    file_count = 0
    for blob in blobs:
        # Get the full path to the file
        blob_path = blob.name
        if blob_path.endswith('/'):
            log.debug(f"skipping directory: {blob_path}")
            continue

        local_file_path = os.path.join(publish_path, blob.name)
        log.info(f"downloading {blob_path} to {local_file_path}")

        # Create directory if it doesn't exist
        local_dir = os.path.dirname(local_file_path)
        if not os.path.exists(local_dir):
            os.makedirs(local_dir)
        blob.download_to_filename(local_file_path)
        file_count += 1

    log.info(f"done, {file_count} files downloaded")


if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    # Get the local publish path from the environment
    publish_path = os.environ.get('PUBLISH_PATH', '/publish')
    source_bucket = os.environ.get('SOURCE_BUCKET', 'source-bucket')
    source_bucket_path = os.environ.get('SOURCE_BUCKET_PATH', '/')
    download_bucket_contents(source_bucket, source_bucket_path, publish_path)
