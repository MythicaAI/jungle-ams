#!/usr/bin/env bash

RELATIVE_PATH=$1

# Path to this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Convert the relative path to the workspace
DOCKERFILE_RELATIVE_PATH=$(realpath "$SCRIPT_DIR/../$RELATIVE_PATH")

# Get the path from github.event.modified files or default to dockerfile path
PYPROJECT_PATH=$(realpath "$DOCKERFILE_RELATIVE_PATH/pyproject.toml")

#echo "Getting tag for $PYPROJECT_PATH"

# Extract the LABEL name="foo" value as foo
PROJECT_NAME=$(cat $PYPROJECT_PATH | grep "LABEL name=" | sed -n 's/.*name=["'"'"']\([^"'"'"']*\)["'"'"'].*/\1/p')

if [ -z "$PROJECT_NAME" ]; then
  echo "Error: Could not find LABEL name in Dockerfile"
  exit 1
fi

# Get latest tag for this path prefix
LATEST_TAG=$(git tag -l "versions/${PROJECT_NAME}/*" --sort=-v:refname | head -n 1)

# Update the current tag
if [ -z "$LATEST_TAG" ]; then
  # No existing tag found, start at pypi default of 0.1.0
  LATEST_TAG="versions/${PROJECT_NAME}/v0.1.0"
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
NEW_TAG="versions/${PROJECT_NAME}/${NEW_VERSION}"

# Current tag
echo "current_tag=$LATEST_TAG"
echo "current_tag_version=$VERSION"

# Output the new tag value
echo "new_tag=$NEW_TAG"
echo "new_tag_version=$NEW_VERSION"

# Output some more variables
echo "project_name=$PROJECT_NAME"
echo "relative_path=$PYPROJECT_PATH"

