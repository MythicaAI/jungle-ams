#!/usr/bin/env python3
"""Development scripts for meshwork."""

import subprocess
import sys


def run(cmd: str, **kwargs) -> int:
    """Run command and return exit code."""
    print(f"→ {cmd}")
    return subprocess.run(cmd, shell=True, **kwargs).returncode


def test() -> int:
    """Run tests."""
    return run("pytest .")


def coverage() -> int:
    """Run tests with coverage."""
    return run("pytest --cov=meshwork --cov-report=html --cov-report=term")


def lint() -> int:
    """Check code quality."""
    return run("ruff check .")


def format_code() -> int:
    """Format code."""
    return run("ruff format .")


def typecheck() -> int:
    """Type check code."""
    return run("mypy .")


def check() -> int:
    """Run all checks (lint + typecheck + test)."""
    return lint() or typecheck() or test()


def fix() -> int:
    """Fix all auto-fixable issues."""
    return run("ruff check --fix .") or format_code()


def clean() -> int:
    """Clean build artifacts."""
    paths = [
        ".pytest_cache",
        "htmlcov",
        ".coverage",
        "dist",
        "build",
        "*.egg-info",
        "__pycache__",
        ".mypy_cache",
        ".ruff_cache",
    ]

    for pattern in paths:
        run(f"rm -rf {pattern}")

    return 0


def install() -> int:
    """Install dependencies."""
    return run("uv sync --group dev")


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Available commands:")
        print("  test      - Run tests")
        print("  coverage  - Run tests with coverage")
        print("  lint      - Check code quality")
        print("  format    - Format code")
        print("  typecheck - Type check code")
        print("  check     - Run all checks")
        print("  fix       - Fix auto-fixable issues")
        print("  clean     - Clean build artifacts")
        print("  install   - Install dependencies")
        return 1

    cmd = sys.argv[1]

    commands = {
        "test": test,
        "coverage": coverage,
        "lint": lint,
        "format": format_code,
        "typecheck": typecheck,
        "check": check,
        "fix": fix,
        "clean": clean,
        "install": install,
    }

    if cmd not in commands:
        print(f"Unknown command: {cmd}")
        return 1

    return commands[cmd]()


if __name__ == "__main__":
    sys.exit(main())
