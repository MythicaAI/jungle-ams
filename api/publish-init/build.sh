#!/usr/bin/env bash
source .vars
docker build --platform linux/amd64 --tag $IMAGE_NAME .
