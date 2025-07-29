#!/usr/bin/env -S uv run --with toml --with build --with twine
"""
Release script that automatically bumps version and publishes to PyPI.
Usage: uv run release.py [major|minor|patch]
"""

import subprocess
import sys
from pathlib import Path

import toml


def load_pyproject():
    """Load and parse pyproject.toml"""
    return toml.load("pyproject.toml")


def save_pyproject(data):
    """Save pyproject.toml with updated data"""
    with open("pyproject.toml", "w") as f:
        toml.dump(data, f)


def bump_version(data, bump_type="patch"):
    """Bump version in pyproject data and return new version"""
    current_version = data["project"]["version"]
    major, minor, patch = map(int, current_version.split("."))

    if bump_type == "major":
        major += 1
        minor = patch = 0
    elif bump_type == "minor":
        minor += 1
        patch = 0
    else:  # patch
        patch += 1

    new_version = f"{major}.{minor}.{patch}"
    data["project"]["version"] = new_version
    return new_version


def git_operations(project_name, new_version):
    """Handle git commit, tag, and push"""
    tag_name = f"releases/pypi/{project_name}/{new_version}"

    subprocess.run(["git", "add", "pyproject.toml"], check=True)
    subprocess.run(["git", "commit", "-m", f"Bump version to {new_version}"], check=True)
    subprocess.run(["git", "tag", tag_name], check=True)
    subprocess.run(["git", "push", "origin", tag_name], check=True)


def build_and_publish():
    """Build and upload to PyPI"""
    subprocess.run(["python", "-m", "build"], check=True)
    subprocess.run(["twine", "upload", "dist/*"], check=True)


def main():
    if not Path("pyproject.toml").exists():
        print("Error: pyproject.toml not found")
        sys.exit(1)

    bump_type = sys.argv[1] if len(sys.argv) > 1 else "patch"

    if bump_type not in ["major", "minor", "patch"]:
        print("Error: bump_type must be 'major', 'minor', or 'patch'")
        sys.exit(1)

    try:
        # Load, update, and save
        data = load_pyproject()
        project_name = data["project"]["name"]
        new_version = bump_version(data, bump_type)
        save_pyproject(data)

        print(f"Bumped {project_name} to version {new_version}")

        # Git operations
        git_operations(project_name, new_version)

        # Build and publish
        build_and_publish()

        print(f"Successfully released {project_name} v{new_version}")

    except KeyError as e:
        print(f"Error: Missing key in pyproject.toml: {e}")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"Error during command execution: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
