from gcid.gcid import _config


def location() -> str:
    """Location accessor helper function"""
    return _config.gcid_location
