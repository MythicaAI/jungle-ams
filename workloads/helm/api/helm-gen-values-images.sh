#!/usr/bin/env bash

# Exit on error
set -ex
# Path to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

OUTPUT_FILE=${OUTPUT_FILE:-"$SCRIPT_DIR/api/values-images.yaml"}

TAG_PREFIX=${1:-versions}

# Function to get tags for a specific image from local git
get_image_tag() {
    local image_name=$1

    # Query version tag for the image name
    git tag -l "${TAG_PREFIX}/${image_name}/*" --sort=-v:refname | head -n 1
}

# Function to extract version from tag
get_version_from_tag() {
    local tag=$1
    echo "$tag" | cut -d/ -f3
}

truncate_camel_case() {
    echo "$1" | awk -F'-' '{
        printf "%s", tolower(substr($2,1,1)) substr($2,2)
        for(i=3; i<=NF; i++) {
            printf "%s", toupper(substr($i,1,1)) substr($i,2)
        }
    }'
}

# Function to generate YAML for a single image
generate_image_yaml() {
    local image_name=$1
    tag=$(get_image_tag "$image_name")

    if [ -n "$tag" ]; then
        version=$(get_version_from_tag "$tag")
        echo "  \"${image_name}\": \"${version}\""
    else
        echo "  \"${image_name}\": \"latest\" # No versions found"
    fi
}

# Start generating YAML
echo "# Generated versions file - $(date -u '+%Y-%m-%d %H:%M:%S UTC')" > "$OUTPUT_FILE"
echo "images:" >> "$OUTPUT_FILE"

# Read image names from stdin (one per line) or from arguments
IMAGES="lets-encrypt \
  mythica-app \
  mythica-job-canary \
  mythica-editor-build \
  mythica-gcs-proxy \
  mythica-sites-build \
  mythica-packager \
  mythica-web-front"
for image_name in $IMAGES; do
    generate_image_yaml "$image_name" "  " >> "$OUTPUT_FILE"
done

echo "Generated YAML file: $OUTPUT_FILE"
