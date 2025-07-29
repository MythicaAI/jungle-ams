#!/usr/bin/env python3
"""Project automation scripts."""

import subprocess
import sys
from pathlib import Path


def run_cmd(cmd: list[str]) -> int:
    """Run command and return exit code."""
    return subprocess.run(cmd, cwd=Path.cwd()).returncode


def test() -> None:
    """Run tests with coverage."""
    exit_code = run_cmd(
        ["pytest", "--cov=gcid", "--cov-report=term-missing", "--cov-report=html"]
    )
    sys.exit(exit_code)


def lint() -> None:
    """Run linting checks."""
    exit_code = run_cmd(["ruff", "check", "."])
    sys.exit(exit_code)


def format() -> None:
    """Format code and fix linting issues."""
    format_code = run_cmd(["ruff", "format", "."])
    fix_code = run_cmd(["ruff", "check", "--fix", "."])
    sys.exit(max(format_code, fix_code))
