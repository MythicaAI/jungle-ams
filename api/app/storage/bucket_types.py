from enum import Enum


class BucketType(str, Enum):
    """The mapping type for bucket storage operations"""
    FILES = "files"  # unprocessed loose files, HDA, HIP, etc
    IMAGES = "images"  # images, proxied for web access
    PACKAGES = "packages"  # packages, used by packager to store prepared packages
