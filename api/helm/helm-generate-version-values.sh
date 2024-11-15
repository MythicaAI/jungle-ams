#!/usr/bin/env bash

# Exit on error
set -ex

# Path to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

OUTPUT_FILE=${OUTPUT_FILE:-"$SCRIPT_DIR/api/values-latest-tags.yaml"}

# Function to get tags for a specific image from local git
get_image_tag() {
    local image_name=$1

    # Query version tag for the image name
    git tag -l "versions/${image_name}/*" --sort=-v:refname | head -n 1
}

# Function to extract version from tag
get_version_from_tag() {
    local tag=$1
    echo "$tag" | cut -d/ -f3
}

# Function to generate YAML for a single image
generate_image_yaml() {
    local image_name=$1

    tag=$(get_image_tag "$image_name")

    if [ -n "$tag" ]; then
        version=$(get_version_from_tag "$tag")
        echo "  ${image_name}:"
        echo "    tag: ${version}"
    else
        echo "  ${image_name}:  # No versions found"
        echo "    tag: latest"
    fi
}

# Start generating YAML
echo "# Generated versions file - $(date -u '+%Y-%m-%d %H:%M:%S UTC')" > "$OUTPUT_FILE"
echo "api:" >> "$OUTPUT_FILE"

# Read image names from stdin (one per line) or from arguments
IMAGES="lets-encrypt \
  mythica-app \
  mythica-canary \
  mythica-editor-build \
  mythica-gcs-proxy \
  mythica-jungle3-build \
  mythica-packager \
  mythica-web-front"
for image_name in $IMAGES; do
    generate_image_yaml "$image_name" "  " >> "$OUTPUT_FILE"
done

echo "Generated YAML file: $OUTPUT_FILE"