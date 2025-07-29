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
tag_for_release() {
    local image_name=$1
    tag=$(get_image_tag "$image_name")

    if [ -z "$tag" ]; then
        echo "failed to find version for image: ${image_name}"
        exit 1
    fi

    release_tag=$(echo $tag | sed s/^versions/releases/)
    git tag $release_tag $tag
    git push origin $release_tag
    echo "## Promoted ${tag} to ${release_tag}"
}

tag_all_for_release() {
    # Read image names from stdin (one per line) or from arguments
    IMAGES="
        api \
        apps \
        automations/genai \
        automations/houdini \
        automations/imagemagick \
        bulk-import \
        canary \
        test-worker"
    for image_name in $IMAGES; do
        tag_for_release "$image_name"
    done
}

IMAGE_ARG=${1:-all}
if [ "$IMAGE_ARG" == "all" ]; then
    tag_all_for_release
else
    tag_for_release $IMAGE_ARG
fi
