#!/usr/bin/env bash

RELATIVE_PATH=$1

# Path to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Convert the relative path to the workspace
DOCKERFILE_RELATIVE_PATH=$(realpath "$SCRIPT_DIR/../../../$RELATIVE_PATH")

# Get the path from github.event.modified files or default to dockerfile path
DOCKERFILE_PATH=$(realpath "$DOCKERFILE_RELATIVE_PATH/Dockerfile")

#echo "Getting tag for $DOCKERFILE_PATH"

# Extract the LABEL name="foo" value as foo
LABEL_NAME=$(cat $DOCKERFILE_PATH | grep "LABEL name=" | sed -n 's/.*name=["'"'"']\([^"'"'"']*\)["'"'"'].*/\1/p')

if [ -z "$LABEL_NAME" ]; then
  echo "Error: Could not find LABEL name in Dockerfile"
  exit 1
fi

# Get latest tag for this path prefix
LATEST_TAG=$(git tag -l "versions/${LABEL_NAME}/*" --sort=-v:refname | head -n 1)

# Update the current tag
if [ -z "$LATEST_TAG" ]; then
  # No existing tag found, starting at 1.0.0
  LATEST_TAG="versions/${LABEL_NAME}/v1.0.0"
fi

# Extract the version number
VERSION=$(echo ${LATEST_TAG} | cut -d/ -f3)
VERSION_NUM=$(echo $VERSION | sed s/^v// | grep -oE '[0-9]+\.[0-9]+\.[0-9]+$')

# Extract major, minor, patch using cut
major=$(echo "$VERSION_NUM" | cut -d. -f1)
minor=$(echo "$VERSION_NUM" | cut -d. -f2)
patch=$(echo "$VERSION_NUM" | cut -d. -f3)

# Increment patch version
new_patch=$((patch + 1))
# echo "Version num $VERSION_NUM -> $major $minor $patch -> $new_patch"

NEW_VERSION="v$major.$minor.$new_patch"
NEW_TAG="versions/${LABEL_NAME}/${NEW_VERSION}"

# Current tag
echo "current_tag=$LATEST_TAG"
echo "current_tag_version=$VERSION"

# Output the new tag value
echo "new_tag=$NEW_TAG"
echo "new_tag_version=$NEW_VERSION"

# Output some more variables
echo "image_name=$LABEL_NAME"
echo "relative_path=$DOCKERFILE_RELATIVE_PATH"

