from cryptid.config import Config
from cryptid.cryptid import _config

def location() -> str:
    """Location accessor helper function"""
    return _config.cryptid_location