#!/usr/bin/env bash

set -x

source .vars

docker tag $IMAGE_NAME:latest $LOCAL_IMAGE
docker tag $LOCAL_IMAGE $REMOTE_IMAGE 
docker push $REMOTE_IMAGE
