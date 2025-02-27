import hashlib
import os
from pathlib import Path
from typing import Iterator, Optional, Self

from pathspec import PathSpec
from pydantic import BaseModel


class FileRef(BaseModel):
    """A reference to a file on the filesystem"""
    size: Optional[int] = 0
    file_id: Optional[str] = None
    relative_path: Optional[Path] = None
    content_hash: Optional[str] = None


class Cache:
    """Cache of file system root"""

    def __init__(self, base_path: Path, parent: Self = None):
        """
        Initialize a new cache at the given base path, if the parent cache is provided, use it
        as a lookup source for files. This cache layer relationship allows clients to keep
        their own private cache of files that are not visible to other clients connected to the
        same server.
        """
        self.base_path = base_path
        self.hits = 0
        self.misses = 0
        self._parent: Optional[Self] = parent
        self._by_relative_path: dict[Path, FileRef] = {}
        self._by_content_hash: dict[str, list[FileRef]] = {}

    @property
    def parent(self) -> Optional[Self]:
        return self._parent

    def find_relative_path(self, path: Path) -> Optional[FileRef]:
        ref = self._by_relative_path.get(path)
        if ref is None and self._parent is not None:
            ref = self._parent._by_relative_path.get(path)
        if ref is None:
            self.misses += 1
        else:
            self.hits += 1
        return ref

    def find_content_hash(self, content_hash: str) -> Optional[list[FileRef]]:
        ref = self._by_content_hash.get(content_hash)
        if not ref and self._parent is not None:
            ref = self._parent._by_content_hash.get(content_hash)
        if ref is None:
            self.misses += 1
        else:
            self.hits += 1
        return ref

    def index_files(self, ignore: list[str] = None) -> int:
        """Index files into the cache, return number of files"""
        self._by_relative_path = {}
        self._by_content_hash = {}

        for file_ref in generate_file_refs(self.base_path, ignore):
            relative_path = file_ref.relative_path
            self._by_relative_path[relative_path] = file_ref
            self._by_content_hash.setdefault(file_ref.content_hash, []).append(file_ref)

        return len(self._by_relative_path)


def generate_file_refs(path: Path, ignore: list[str]) -> Iterator[FileRef]:
    ignore = ignore or []
    default_ignore = ['.DS_Store']
    ignore_spec = PathSpec.from_lines("gitignore", ignore + default_ignore)
    for root, _, files in os.walk(path):
        for file in files:
            abs_path = os.path.join(root, file)
            relative_path = os.path.relpath(abs_path, path)
            # skip files in the ignore spec
            if ignore_spec.match_file(relative_path):
                continue

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
