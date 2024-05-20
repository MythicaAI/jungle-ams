#!/usr/bin/env bash

set -x

source .vars

docker tag $IMAGE_NAME:latest $IMAGE_NAME:$COMMIT_HASH

docker tag $IMAGE_NAME:latest $REMOTE_IMAGE_NAME:latest
docker tag $IMAGE_NAME:$COMMIT_HASH $REMOTE_IMAGE_NAME:$COMMIT_HASH

docker push $REMOTE_IMAGE_NAME --all-tags

echo "pushed latest version: $COMMIT_HASH"
