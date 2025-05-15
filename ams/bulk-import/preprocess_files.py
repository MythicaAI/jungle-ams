"""
Recursively walks a directory tree and renames any files or
sub‑directories whose names contain characters that Perforce does not
accept (wildcards, Unicode, etc.). Disallowed characters are replaced
with an underscore ("_"). Name collisions are resolved by appending a
numeric suffix (e.g. _1, _2, ...).
"""

from __future__ import annotations

import argparse
import os
import re
from pathlib import Path
import unicodedata

SAFE_CHARS = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!$&'()+,-.;=[]^_`{}~ ")

def sanitize(name: str) -> str:
    """Return a sanitized version of *name* suitable for Perforce."""
    # Normalize the Unicode string first to ensure consistent handling
    name = unicodedata.normalize('NFC', name)
    
    # Process each character individually and build the result
    result = []
    for char in name:
        if char in SAFE_CHARS:
            result.append(char)
        else:
            result.append("_")
            
    clean = "".join(result)

    # Avoid empty names (rare but possible if every char was disallowed)
    return clean or "_"

def unique_path(parent: Path, candidate: str) -> str:
    """If *candidate* already exists in *parent*, append a numeric suffix until unique."""
    stem, ext = os.path.splitext(candidate)
    n = 1
    new_name = candidate
    while (parent / new_name).exists():
        new_name = f"{stem}_{n}{ext}"
        n += 1
    return new_name

def rename_path(path: Path, dry_run: bool = False) -> Path:
    """Sanitize *path* (file or directory) and rename if necessary.

    Returns the final Path after any renaming.
    """
    parent = path.parent
    sanitized = sanitize(path.name)
    if sanitized != path.name:
        sanitized = unique_path(parent, sanitized)
        target = parent / sanitized
        print(f"{path} -> {target}")
        if not dry_run:
            path.rename(target)
            return target
    return path

def traverse(root: Path, dry_run: bool = False) -> None:
    """Depth‑first traversal so we rename children before their parent dirs."""
    for dirpath, dirnames, filenames in os.walk(root, topdown=False):
        current = Path(dirpath)
        # Process files first
        for fname in filenames:
            rename_path(current / fname, dry_run)
        # Then the directory itself (after contents handled)
        rename_path(current, dry_run)

def main() -> None:
    parser = argparse.ArgumentParser(description="Sanitize file and directory names for Perforce.")
    parser.add_argument("root", type=Path, help="Root directory to scan")
    parser.add_argument("--dry-run", action="store_true", help="Preview changes without renaming")
    args = parser.parse_args()

    if not args.root.exists() or not args.root.is_dir():
        parser.error(f"{args.root} is not a valid directory")

    traverse(args.root, dry_run=args.dry_run)

if __name__ == "__main__":
    main()
