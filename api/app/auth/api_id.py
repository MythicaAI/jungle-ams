import hashlib
import hmac
import logging

import base58
from Crypto.Cipher import Blowfish  # Used for 8byte block size

from config import app_config

DIGEST_SIZE = 16
HMAC_BYTES = 2
_ENC_KEY: bytes = app_config().id_enc_key.encode('utf-8')
_HMAC_KEY: bytes = app_config().id_hmac_key.encode('utf-8')
_PERSON: bytes = 'id'.encode('utf-8')

cipher = Blowfish.new(_ENC_KEY, Blowfish.MODE_ECB)

log = logging.getLogger(__name__)


def seq_to_id(seq):
    """Given a 64bit integer, return an encrypted version with a fixed HMAC"""
    assert type(seq) is int
    encrypted = cipher.encrypt(seq.to_bytes(8, 'big'))
    h = hashlib.blake2b(digest_size=DIGEST_SIZE, key=_HMAC_KEY, person=_PERSON)
    h.update(encrypted)
    digest = h.digest()
    combined = encrypted + digest[0:HMAC_BYTES]
    encoded = base58.b58encode(combined)

    print(f"encrypted {encrypted}, signature: {digest[0:HMAC_BYTES]}, encoded: {encoded}")

    return encoded


def id_to_seq(api_id) -> int:
    """Validate and decode an encrypted serial number"""
    assert type(id) is str

    # Base58 decode the obfuscated serial number
    combined = base58.b58decode(api_id)

    # Extract the encrypted serial number and HMAC
    encrypted: bytes = combined[0:8]
    serial_hmac = combined[8:]
    if len(serial_hmac) != HMAC_BYTES:
        raise ValueError("HMAC byte count mismatch")

    # Verify the HMAC
    h = hashlib.blake2b(digest_size=DIGEST_SIZE, key=_HMAC_KEY, person=_PERSON)
    h.update(encrypted)
    digest = h.digest()
    if not hmac.compare_digest(serial_hmac, digest[0:2]):
        raise ValueError("Invalid HMAC - data may have been tampered with")

    # Decrypt the serial number
    decrypted_serial = cipher.decrypt(encrypted)

    return int.from_bytes(decrypted_serial, 'big')
