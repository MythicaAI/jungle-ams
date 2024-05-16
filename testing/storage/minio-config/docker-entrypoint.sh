#!usr/bin/sh
#
# Add the test access to minio, this container depends on minio
# having started so it is ready for these commands
mc alias set local http://${MINIO_ENDPOINT} minio minio123
mc admin user add local ${MINIO_ACCESS_KEY} ${MINIO_SECRET_KEY}
mc admin policy attach local readwrite --user=${MINIO_ACCESS_KEY}
