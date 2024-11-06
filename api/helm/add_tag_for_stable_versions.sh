#!/usr/bin/env bash

# Script sets the union tag for images of back and front with desired stable versions
# It will be used in deployment

list_latest_tags() {
    local image_name="$1"
    echo "Latest tags for $image_name:"
    gcloud artifacts docker tags list "$image_name" --project=controlnet-407314 --limit=30 --sort-by=~updateTime --format="value(tag)"
}

FRONT_IMAGE_NAME="us-central1-docker.pkg.dev/controlnet-407314/gke-us-central1-images/mythica-web-front"
BACK_IMAGE_NAME="us-central1-docker.pkg.dev/controlnet-407314/gke-us-central1-images/mythica-app"

list_latest_tags "$FRONT_IMAGE_NAME"
read -p "Enter the FRONT version tag: " FRONT_VERSION

list_latest_tags "$BACK_IMAGE_NAME"
read -p "Enter the BACK version tag: " APP_VERSION

# Create the new tag
NEW_TAG="f.${FRONT_VERSION/v./}.b.${APP_VERSION/v./}"
echo "Creating new tag: $NEW_TAG"

# Tag the images with the new tag
if gcloud artifacts docker images add-tag "$FRONT_IMAGE_NAME:$FRONT_VERSION" "$FRONT_IMAGE_NAME:$NEW_TAG" --project=controlnet-407314; then
    echo "Successfully tagged front image."
else
    echo "Error tagging front image."
    exit 1
fi

if gcloud artifacts docker images add-tag "$BACK_IMAGE_NAME:$APP_VERSION" "$BACK_IMAGE_NAME:$NEW_TAG" --project=controlnet-407314; then
    echo "Successfully tagged back image."
else
    echo "Error tagging back image."
    exit 1
fi

export APP_VERSION
export FRONT_VERSION
export NEW_TAG