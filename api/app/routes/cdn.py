"""Functions for CDN route handling"""

def translate_download_url(locators: list[str], content_hash:str) -> str:
    return f"https://implementme.notadomain/{content_hash}"
