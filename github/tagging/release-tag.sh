#!/usr/bin/env bash

# Path to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Function to get tags for a specific image from local git
get_image_tag() {
    local image_name=$1

    # Query version tag for the image name
    git tag -l "versions/${image_name}/*" --sort=-v:refname | head -n 1
}


# Function to generate YAML for a single image
build_release_tag() {
    local image_name=$1
    tag=$(get_image_tag "$image_name")

    if [ -z "$tag" ]; then
        echo "failed to find version for image: ${image_name}"
        exit 1
    fi

    release_tag=$(echo $tag | sed s/^versions/releases/)
    echo $release_tag
}

promote_all() {
    # Read image names from stdin (one per line) or from arguments
    IMAGES="lets-encrypt \
        mythica-app \
        mythica-job-canary \
        mythica-editor-build \
        mythica-gcs-proxy \
        mythica-jungle3-build \
        mythica-packager \
        mythica-web-front"
    for image_name in $IMAGES; do
        build_release_tag "$image_name"
    done
}

IMAGE_ARG=${1:-all}
if [ "$IMAGE_ARG" == "all" ]; then
    promote_all
else
    build_release_tag $IMAGE_ARG
fi
