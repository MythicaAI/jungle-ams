import hashlib
import os
from pathlib import Path
from typing import Iterator, Optional

from pydantic import BaseModel


class FileRef(BaseModel):
    """A reference to a file on the filesystem"""
    size: Optional[int]
    file_id: Optional[str]
    relative_path: Path
    content_hash: str


class Cache(BaseModel):
    """Cache of file system root"""
    base_path: Path
    by_relative_path: dict[Path, FileRef]
    by_content_hash: dict[str, list[FileRef]]


def generate_file_refs(path: Path) -> Iterator[FileRef]:
    for root, _, files in os.walk(path):
        for file in files:
            abs_path = os.path.join(root, file)
            relative_path = os.path.relpath(abs_path, path)
            file_size = os.path.getsize(abs_path)

            # Calculate SHA1 hash
            hasher = hashlib.sha1()
            chunk_size = 1024 * 64
            with open(abs_path, "rb") as f:
                while chunk := f.read(chunk_size):
                    hasher.update(chunk)
            content_hash = hasher.hexdigest()

            # Create FileRef and populate dictionaries
            yield FileRef(
                size=file_size,
                relative_path=Path(relative_path),
                content_hash=content_hash)


def index_files(path: Path) -> Cache:
    """Given a base path produce a cache"""
    by_relative_path = {}
    by_content_hash = {}

    for file_ref in generate_file_refs(path):
        relative_path = file_ref.relative_path
        by_relative_path[relative_path] = file_ref
        by_content_hash.setdefault(file_ref.content_hash, []).append(file_ref)

    cache = Cache(
        base_path=path,
        by_relative_path=by_relative_path,
        by_content_hash=by_content_hash)
    return cache


def encode_file(cache, relative_path: Path) -> Iterator[bytes]:
    """Given a filename produce an iterator of byte frames"""
    chunk_size = 64 * 1024
    file_path = str(cache.base_path / relative_path)
    with open(file_path, "rb") as f:
        yield f.read(chunk_size)


def encode_cache_file(cache, hash) -> Iterator[bytes]:
    """Find a hash in the cache and encode it"""
    file_ref = cache.by_hash.get(hash)
    if file_ref is None:
        raise FileNotFoundError(hash)
    return encode_file(cache, file_ref.relative_path)
