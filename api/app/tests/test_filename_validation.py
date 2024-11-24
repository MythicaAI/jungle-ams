"""Test the validation of filenames"""

# pylint: disable=redefined-outer-name, unused-import

import os

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


def test_directory_traversal(validator):
    malicious_paths = [
        "../file.txt",
        "../../file.txt",
        "/etc/passwd",
        "folder/../file.txt",
        "..\\file.txt",  # Windows style
        "folder\\..\\file.txt",  # Windows style
    ]

    for path in malicious_paths:
        with pytest.raises(ValidationError) as exc:
            validator(path)
        assert "directory traversal patterns" in str(exc.value) \
               or "period" in str(exc.value) \
               or "can only" in str(exc.value) \
               or "contains invalid" in str(exc.value) \
               or "forward slash" in str(exc.value)


def test_null_bytes(validator):
    malicious_nulls = [
        "file\x00.txt",
        "file\u0000.txt",
        "malicious\x00hidden.txt",
    ]

    for filename in malicious_nulls:
        with pytest.raises(ValidationError) as exc:
            validator(filename)
        assert "null bytes" in str(exc.value)


def test_invalid_characters(validator):
    invalid_chars = [
        "file<.txt",
        "file>.txt",
        'file".txt',
        "file:.txt",
        "file?.txt",
        "file*.txt",
        "file|.txt",
        "file/.txt",
        "file\\.txt",
    ]

    for filename in invalid_chars:
        with pytest.raises(ValidationError) as exc:
            validator(filename)
        assert "invalid characters" in str(exc.value) \
               or "can only" in str(exc.value)


def test_control_characters(validator):
    control_chars = [
        "file\n.txt",  # newline
        "file\r.txt",  # carriage return
        "file\t.txt",  # tab
        "file\b.txt",  # backspace
        "file\f.txt",  # form feed
    ]

    for filename in control_chars:
        with pytest.raises(ValidationError) as exc:
            validator(filename)
        assert "control characters" in str(exc.value)


def test_leading_trailing_spaces(validator):
    invalid_spaces = [
        " file.txt",
        "file.txt ",
        "  file.txt",
        "file.txt  ",
    ]

    for filename in invalid_spaces:
        with pytest.raises(ValidationError) as exc:
            validator(filename)
        assert "start or end with spaces" in str(exc.value)


def test_leading_dots(validator):
    hidden_files = [
        ".hidden.txt",
        "..file.txt",
        ".ssh.txt",
    ]

    for filename in hidden_files:
        with pytest.raises(ValidationError) as exc:
            validator(filename)
        assert "start with a period" in str(exc.value)


def test_empty_filename(validator):
    empty_names = [
        ".txt",
        "",
        ".",
        "..",
    ]

    for filename in empty_names:
        with pytest.raises(ValidationError) as exc:
            validator(filename)
        assert "must have a name part" in str(exc.value) \
               or "min_length" in str(exc.value) \
               or "period" in str(exc.value) \
               or "at least 1" in str(exc.value)


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


def test_invalid_patterns(validator):
    invalid_patterns = [
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
    ]

    for filename in invalid_patterns:
        with pytest.raises(ValidationError) as exc:
            validator(filename)
        assert "can only contain letters" in str(exc.value)


def test_path_length(validator):
    # Create a filename that would exceed system max path length
    system_max = os.pathconf('/', 'PC_PATH_MAX')
    long_filename = "a" * system_max + ".txt"

    with pytest.raises(ValidationError) as exc:
        validator(long_filename)
    assert "at most" in str(exc.value)


def test_valid_filenames(validator):
    valid_files = [
        "normal.txt",
        "report-2024.pdf",
        "my file.png",
        "sample_data.csv",
        "image-1.jpg",
        "document1.pdf",
        "sub-path/myhda.hda",
        "two/paths/something.hdalc"
    ]

    for filename in valid_files:
        # Should not raise any exception
        assert validator(filename) is True


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


def test_case_insensitive_extensions(validator):
    uppercase_extensions = [
        "malicious.EXE",
        "script.VBS",
        "macro.XLSM",
    ]

    for filename in uppercase_extensions:
        with pytest.raises(ValidationError) as exc:
            validator(filename)
        assert "extension is potentially dangerous" in str(exc.value)
