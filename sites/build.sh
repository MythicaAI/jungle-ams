#!/usr/bin/env bash
#
set -x

SITE_NAME=${1:-jungle}
COMMIT_HASH=$(git rev-parse --short=8 HEAD)

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Reference the local file relative to the script's directory
LOCAL_PATH="$SCRIPT_DIR/$SITE_NAME/dist"

mkdir -p $LOCAL_PATH

LOCAL_PATH=$(realpath $SITE_NAME)
IMAGE_TAG="mythica-$SITE_NAME:$COMMIT_HASH"
CONTAINER_NAME="mythica-$SITE_NAME-$COMMIT_HASH"

#
# If site has a docker file build it
#
if [[ -f $SITE_NAME/Dockerfile ]]; then
  docker rm $CONTAINER_NAME

  pushd $SITE_NAME
  docker build -t $IMAGE_TAG .
  popd
  # file mapping is interesting but problematic on windows
  # docker run -it --rm -v $LOCAL_PATH:/app/dist $IMAGE_TAG
  docker run -it --name $CONTAINER_NAME $IMAGE_TAG
  docker cp $CONTAINER_NAME:/app/dist $LOCAL_PATH
  docker rm $CONTAINER_NAME
else
  echo $SITE_NAME does not have a Dockerfile
  exit 1
fi
