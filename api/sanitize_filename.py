import re
import unicodedata


def sanitize_filename(name: str, max_length: int = 255, replacement: str = "_") -> str:
    """
    Sanitize a string for use as a filename by removing or replacing unsafe characters.

    :param name: The original filename string.
    :param max_length: The maximum length of the filename (default: 255).
    :param replacement: The character to replace unsafe characters with (default: "_").
    :return: A safe filename string.
    """
    # Normalize Unicode (e.g., é → e)
    name = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode("ascii")

    # Define characters to remove or replace
    unsafe_chars = r'[<>:"/\\|?*\x00-\x1F]'  # Disallowed in Windows & Unix filenames
    name = re.sub(unsafe_chars, replacement, name)

    # Replace multiple replacements with a single one
    name = re.sub(rf"{re.escape(replacement)}+", replacement, name).strip(replacement)

    # Trim to max_length
    return name[:max_length] if len(name) > max_length else name
