#!/usr/bin/env bash

# Increments the highest major, minor and patch.
# Makes new tag, sets new version for app and front, pushes changes to git

VERSION_APP_PATH="api/app/VERSION_APP"
VERSION_FRONT_PATH="sites/VERSION_FRONT"

APP_VERSION=$(cat "$VERSION_APP_PATH")
FRONT_VERSION=$(cat "$VERSION_FRONT_PATH")

current_app_version="${APP_VERSION#v}"
current_front_version="${FRONT_VERSION#v}"

IFS='.' read -r app_major app_minor app_patch <<< "$current_app_version"
IFS='.' read -r front_major front_minor front_patch <<< "$current_front_version"

if (( app_major > front_major )); then
    highest_major=$app_major
    highest_minor=$app_minor
    new_patch=$((app_patch + 1))
else
    if (( app_major == front_major )); then
        highest_major=$app_major
        
        if (( app_minor > front_minor )); then
            highest_minor=$app_minor
            new_patch=$((app_patch + 1))
        else
            if (( app_minor == front_minor )); then
                highest_minor=$app_minor
                new_patch=$(( app_patch > front_patch ? app_patch : front_patch ))
                new_patch=$((new_patch + 1))
            else
                highest_minor=$front_minor
                new_patch=$((front_patch + 1))
            fi
        fi
    else
        highest_major=$front_major
        highest_minor=$front_minor
        new_patch=$((front_patch + 1))
    fi
fi

new_version="v$highest_major.$highest_minor.$new_patch"

echo "New version: $new_version"
echo "$new_version" > "$VERSION_APP_PATH"
echo "$new_version" > "$VERSION_FRONT_PATH"

git add "$VERSION_APP_PATH" "$VERSION_FRONT_PATH"
git commit -m "Update version to $new_version"
git tag "$new_version"
git push


git push origin "$new_version"

# Verify if rollback succeeded
if [ $? -eq 0 ]; then
  exit 0
else
  git push infra "$new_version"
fi

