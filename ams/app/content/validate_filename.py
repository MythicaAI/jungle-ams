import os
import posixpath
import re
import unicodedata
from typing import Annotated

from pydantic import BaseModel, Field, field_validator

# Block dangerous extensions
dangerous_extensions = {
    # Executable files
    '.exe', '.dll', '.so', '.dylib', '.bin', '.cmd', '.bat', '.sh', '.com',
    '.gadget', '.msi', '.msp', '.scr', '.hta', '.cpl', '.msc', '.jar',
    '.vb', '.vbs', '.vbe', '.js', '.jse', '.ws', '.wsf', '.wsc', '.wsh',
    '.ps1', '.ps1xml', '.ps2', '.ps2xml', '.psc1', '.psc2', '.msh',
    '.msh1', '.msh2', '.mshxml', '.msh1xml', '.msh2xml', '.scf', '.lnk',
    '.inf', '.reg', '.au3', '.ade', '.adp', '.app', '.csh', '.ksh',

    # Office documents with macro support
    '.doc', '.dot', '.wbk', '.docm', '.dotm', '.xlm', '.xla', '.xlam',
    '.xll', '.xlw', '.pptm', '.potm', '.ppam', '.ppsm', '.sldm',
    '.xlsm',

    # Other potentially dangerous formats
    '.chm', '.hlp', '.application',
    '.mst', '.ops', '.pcd', '.prg', '.wch', '.workflow',

    # Archive formats that could contain dangerous files
    # TODO: archive validation
    # '.zip', '.rar', '.7z', '.gz', '.tar', '.tgz', '.cab',

    # Browser executable formats
    '.xpi', '.crx', '.wasm',

    # Additional script formats
    '.php', '.php3', '.php4', '.php5', '.phtml', '.py', '.rb', '.pl',

    # Configuration files that could trigger actions
    '.bashrc', '.profile', '.config',
}


class ValidateFilename(BaseModel):
    """Simple type used for consistent filename validation"""
    filename: Annotated[str, Field(min_length=1, max_length=255)]


class FileInfo(BaseModel):
    filename: Annotated[str, Field(min_length=1, max_length=255)]

    @field_validator('filename')
    @classmethod
    def validate_filename(cls, value: str) -> str:
        # Normalize Unicode characters to prevent homograph attacks
        normalized = unicodedata.normalize('NFKC', value)
        if normalized != value:
            raise ValueError(
                'Filename contains non-normalized Unicode characters',
            )

        # Check for null bytes (potential security vulnerability)
        if '\0' in value:
            raise ValueError(
                'Filename contains null bytes',
            )

        # Collapse directories parent references of posix paths
        value = posixpath.relpath(value)

        if value.startswith('.'):
            raise ValueError(
                'Filename cannot start with a period',
            )

        if value.startswith('/'):
            raise ValueError(
                'Filename cannot start with a forward slash',
            )

        # Check for invalid characters
        invalid_chars = '<>:"\\|?*'
        if any(char in value for char in invalid_chars):
            raise ValueError(
                f'Filename contains invalid characters: {[c for c in value if c in invalid_chars]}',
            )

        # Check for control characters
        if any(unicodedata.category(char).startswith('C') for char in value):
            raise ValueError(
                'Filename contains control characters',
            )

        # Check leading/trailing spaces and dots
        if value.strip() != value:
            raise ValueError(
                'Filename cannot start or end with spaces',
            )

        # Validate name and extension is not empty or path/.hidden
        name, ext = os.path.splitext(value)
        basename = os.path.basename(value)
        if not name or not basename or basename.startswith('.'):
            raise ValueError(
                'Filename must have a name part, not just extension',
            )

        if ext.lower() in dangerous_extensions:
            raise ValueError(
                'File extension is potentially dangerous and not allowed',
            )

        # Validate character pattern
        pattern = r'^[\w\-. /]+$'
        if not re.match(pattern, value):
            raise ValueError(
                'Filename can only contain letters, numbers, dashes, dots, spaces and forward slashes',
            )

        return value


def validate_filename(filename: str) -> bool:
    """Validate the input filename, raises a ValidationError, returns true if valid"""
    FileInfo(filename=filename)
    return True
