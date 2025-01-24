#!usr/bin/sh
#
# Add the test access to minio, this container depends on minio
# having started so it is ready for these commands
mc alias set local http://${MINIO_ENDPOINT} ${MINIO_ROOT_USER} ${MINIO_ROOT_PASSWORD}
mc mb ${MINIO_ENDPOINT}/images
mc mb ${MINIO_ENDPOINT}/packages
mc mb ${MINIO_ENDPOINT}/files
mc anonymous set download local/files
mc anonymous set download local/images
mc admin accesskey create local --name 'Mythica Default' --access-key foo-access --secret-key bar-secret --policy policy.json