import hashlib
import hmac
import logging
from enum import Enum

import base58
from Crypto.Cipher import Blowfish  # Used for 8byte block size
from pydantic import BaseModel

from config import app_config

DIGEST_SIZE = 16

# ID encoding constants
_HMAC_BYTES = 4
_SEQ_BYTES = 8
_PREFIX_BYTES = 8
_ENCRYPTED_BYTES = _PREFIX_BYTES + _SEQ_BYTES

_ENC_KEY: bytes = app_config().id_enc_key.encode('utf-8')
_HMAC_KEY: bytes = app_config().id_hmac_key.encode('utf-8')
_PERSON: bytes = 'id'.encode('utf-8')

# ID metadata
_VERSION = b'\01'
_LOCATION_PARTITION = b'\00\00\00\00\00\00\00'
_API_ID_PREFIX = _VERSION + _LOCATION_PARTITION

cipher = Blowfish.new(_ENC_KEY, Blowfish.MODE_ECB)

log = logging.getLogger(__name__)


class IdType(Enum):
    """Type enum for ID prefixes"""
    PROFILE = 'prf'
    ORG = 'org'
    ASSET = "asset"
    FILE = "file"
    EVENT = 'evt'


id_rev_map = {i.value: i for i in list(IdType)}


class DbSeq(BaseModel):
    id_type: IdType
    prefix: bytes
    seq: int


def seq_to_id(api_type: IdType, seq: int) -> str:
    """Given a 64bit integer, return an encrypted version with a fixed HMAC"""
    assert type(seq) is int
    seq_bytes = seq.to_bytes(8, 'big')
    encrypted = cipher.encrypt(_API_ID_PREFIX + seq_bytes)
    assert len(encrypted) == _ENCRYPTED_BYTES

    h = hashlib.blake2b(digest_size=DIGEST_SIZE, key=_HMAC_KEY, person=_PERSON)
    h.update(encrypted)
    digest = h.digest()
    combined = encrypted + digest[0:_HMAC_BYTES]
    encoded = base58.b58encode(combined)

    return ''.join((api_type.value, '_', encoded.decode('utf-8')))


def id_to_seq(api_id: str) -> DbSeq:
    """Validate and decode an encrypted serial number"""
    assert type(api_id) is str

    type_str, api_id = api_id.split('_')
    id_type = id_rev_map[type_str]

    # Base58 decode the obfuscated serial number
    combined = base58.b58decode(api_id)

    # Extract the encrypted serial number and HMAC
    encrypted: bytes = combined[0:_ENCRYPTED_BYTES]
    serial_hmac = combined[_ENCRYPTED_BYTES:]
    if len(serial_hmac) != _HMAC_BYTES:
        raise ValueError("HMAC byte count mismatch")

    # Verify the HMAC
    h = hashlib.blake2b(digest_size=DIGEST_SIZE, key=_HMAC_KEY, person=_PERSON)
    h.update(encrypted)
    digest = h.digest()
    if not hmac.compare_digest(serial_hmac, digest[0:_HMAC_BYTES]):
        raise ValueError("Invalid HMAC - data may have been tampered with")

    # Decrypt the serial number
    decrypted_data = cipher.decrypt(encrypted)
    prefix = decrypted_data[0:_PREFIX_BYTES]
    seq = decrypted_data[_PREFIX_BYTES:]
    assert len(seq) == _SEQ_BYTES

    return DbSeq(id_type=id_type,
                 prefix=prefix,
                 seq=int.from_bytes(seq, 'big'))


def asset_seq_to_id(asset_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.ASSET, asset_seq)


def asset_id_to_seq(asset_id: str) -> int:
    """Convert asset ID to encrypted seq"""
    seq = id_to_seq(asset_id)
    assert seq.id_type == IdType.ASSET
    return seq.seq


def profile_seq_to_id(profile_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.PROFILE, profile_seq)


def profile_id_to_seq(profile_id: str) -> int:
    """Convert asset ID to encrypted seq"""
    seq = id_to_seq(profile_id)
    assert seq.id_type == IdType.PROFILE
    return seq.seq


def org_seq_to_id(org_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.ORG, org_seq)


def org_id_to_seq(org_id: str) -> int:
    """Convert asset ID to encrypted seq"""
    seq = id_to_seq(org_id)
    assert seq.id_type == IdType.ORG
    return seq.seq


def file_seq_to_id(file_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.FILE, file_seq)


def file_id_to_seq(file_id: str) -> int:
    """Convert asset ID to encrypted seq"""
    seq = id_to_seq(file_id)
    assert seq.id_type == IdType.FILE
    return seq.seq


def event_seq_to_id(file_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.EVENT, file_seq)


def event_id_to_seq(file_id: str) -> int:
    """Convert asset ID to encrypted seq"""
    seq = id_to_seq(file_id)
    assert seq.id_type == IdType.EVENT
    return seq.seq
