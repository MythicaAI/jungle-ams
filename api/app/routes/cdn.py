"""Functions for CDN route handling"""

import logging

log = logging.getLogger(__name__)

def translate_download_url(locators: list[str], content_hash:str) -> str:
    for locator in locators:
        log.debug("translating %s", locator)
    return f"https://implementme.notadomain/{content_hash}"
