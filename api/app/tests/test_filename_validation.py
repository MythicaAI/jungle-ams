"""Test the validation of filenames"""

# pylint: disable=redefined-outer-name, unused-import

import os
import sys

import pytest
from pydantic import ValidationError

from content.validate_filename import validate_filename


@pytest.fixture
def validator():
    def _validate(filename: str) -> bool:
        return validate_filename(filename)

    return _validate


def test_unicode_normalization(validator):
    # Test homograph attacks and unicode normalization
    with pytest.raises(ValidationError) as exc:
        validator("file．txt")  # Full-width period
    assert "non-normalized Unicode characters" in str(exc.value)

    with pytest.raises(ValidationError) as exc:
        validator("𝓯𝓲𝓵𝓮.txt")  # Fancy unicode letters
    assert "non-normalized Unicode characters" in str(exc.value)


@pytest.mark.parametrize("malicious_paths", [
    "../file.txt",
    "../../file.txt",
    "/etc/passwd",
    "folder/../../file.txt",
    "..\\file.txt",  # Windows style
    "folder\\..\\file.txt",  # Windows style
])
def test_directory_traversal(validator, malicious_paths):
    with pytest.raises(ValidationError) as exc:
        validator(malicious_paths)
    assert "directory traversal patterns" in str(exc.value) \
           or "period" in str(exc.value) \
           or "can only" in str(exc.value) \
           or "contains invalid" in str(exc.value) \
           or "forward slash" in str(exc.value)


@pytest.mark.parametrize("malicious_nulls", [
    "file\x00.txt",
    "file\u0000.txt",
    "malicious\x00hidden.txt",
])
def test_null_bytes(validator, malicious_nulls):
    with pytest.raises(ValidationError) as exc:
        validator(malicious_nulls)
    assert "null bytes" in str(exc.value)


@pytest.mark.parametrize("invalid_chars", [
    "file<.txt",
    "file>.txt",
    'file".txt',
    "file:.txt",
    "file?.txt",
    "file*.txt",
    "file|.txt",
    "file/.txt",
    "file\\.txt",
])
def test_invalid_characters(validator, invalid_chars):
    with pytest.raises(ValidationError) as exc:
        validator(invalid_chars)
    assert "invalid characters" in str(exc.value) \
           or "can only" in str(exc.value) \
           or "must have a name" in str(exc.value)


@pytest.mark.parametrize("control_chars", [
    "file\n.txt",  # newline
    "file\r.txt",  # carriage return
    "file\t.txt",  # tab
    "file\b.txt",  # backspace
    "file\f.txt",  # form feed
])
def test_control_characters(validator, control_chars):
    with pytest.raises(ValidationError) as exc:
        validator(control_chars)
    assert "control characters" in str(exc.value)


@pytest.mark.parametrize("invalid_space", [
    " file.txt",
    "file.txt ",
    "  file.txt",
    "file.txt  ",
]
                         )
def test_leading_trailing_spaces(validator, invalid_space):
    with pytest.raises(ValidationError) as exc:
        validator(invalid_space)
    assert "start or end with spaces" in str(exc.value)


@pytest.mark.parametrize("hidden_file", [
    ".hidden.txt",
    "..file.txt",
    "path/.hidden",
    ".ssh.txt",
])
def test_leading_dots(validator, hidden_file):
    with pytest.raises(ValidationError) as exc:
        validator(hidden_file)
    assert "start with a period" in str(exc.value) \
           or "have a name part" in str(exc.value)


@pytest.mark.parametrize("empty_name", [
    ".txt",
    "",
    ".",
    "..",
])
def test_empty_filename(validator, empty_name):
    with pytest.raises(ValidationError) as exc:
        validator(empty_name)
    assert "must have a name part" in str(exc.value) \
           or "min_length" in str(exc.value) \
           or "period" in str(exc.value) \
           or "at least 1" in str(exc.value) \
           or "extensions are required" in str(exc.value)


@pytest.mark.parametrize("dangerous_ext", [
    # Executables
    ".exe", ".dll", ".so", ".dylib", ".bin", ".cmd", ".bat",
    # Scripts
    ".ps1", ".sh", ".vbs", ".js", ".php", ".py", ".rb",
    # Office with macros
    ".docm", ".xlsm", ".pptm",
    # Browser extensions
    ".xpi", ".crx", ".wasm",
])
def test_dangerous_extensions(validator, dangerous_ext):
    filename = f"malicious{dangerous_ext}"
    with pytest.raises(ValidationError) as exc:
        validator(filename)
    assert "extension is potentially dangerous" in str(exc.value)


@pytest.mark.parametrize("invalid_pattern", [
    "file@.txt",
    "file#.txt",
    "file$.txt",
    "file%.txt",
    "file^.txt",
    "file&.txt",
    "file+.txt",
    "file=.txt",
    "file`.txt",
    "file{}.txt",
    "file[].txt",
])
def test_invalid_patterns(validator, invalid_pattern):
    with pytest.raises(ValidationError) as exc:
        validator(invalid_pattern)
    assert "can only contain letters" in str(exc.value)


def test_path_length(validator):
    system_max = 4096  # derived from alpine python os.pathconf('/', 'PC_PATH_MAX')
    long_filename = ("a" * system_max) + ".txt"
    with pytest.raises(ValidationError) as exc:
        validator(long_filename)
    assert "at most" in str(exc.value)


@pytest.mark.parametrize("valid_file", [
    "normal.txt",
    "report-2024.pdf",
    "my file.png",
    "sample_data.csv",
    "image-1.jpg",
    "document1.pdf",
    "sub-path/myhda.hda",
    "two/paths/something.hdalc"
])
def test_valid_filenames(validator, valid_file):
    # Should not raise any exception
    assert validator(valid_file) is True


@pytest.mark.parametrize("test_input,expected_message", [
    ("file\x00.txt", "null bytes"),
    ("../etc/passwd", "start with a period"),
    ("file*.txt", "invalid characters"),
    ("file\n.txt", "control characters"),
    (" file.txt", "start or end with spaces"),
    (".hidden.txt", "start with a period"),
    ("malicious.exe", "extension is potentially dangerous"),
    ("file@#$.txt", "can only contain letters"),
])
def test_combined_validations(validator, test_input, expected_message):
    with pytest.raises(ValidationError) as exc:
        validator(test_input)
    assert expected_message in str(exc.value)


@pytest.mark.parametrize("uppercase_extension", [
    "malicious.EXE",
    "script.VBS",
    "macro.XLSM",
]
                         )
def test_case_insensitive_extensions(validator, uppercase_extension):
    with pytest.raises(ValidationError) as exc:
        validator(uppercase_extension)
    assert "extension is potentially dangerous" in str(exc.value)
