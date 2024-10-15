"""Cryptographic, location aware ID conversions"""

import hashlib
import hmac
import logging
from enum import Enum

import base58
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from pydantic import BaseModel

from cryptid.config import Config

_config = Config()

DIGEST_SIZE = 16

# ID encoding constants
_HMAC_BYTES = 4
_SEQ_BYTES = 8
_PREFIX_BYTES = 8
_ENCRYPTED_BYTES = _PREFIX_BYTES + _SEQ_BYTES

_ENC_KEY: bytes = _config.cryptid_enc_key.encode('utf-8')
_HMAC_KEY: bytes = _config.cryptid_hmac_key.encode('utf-8')
_PERSON: bytes = 'id'.encode('utf-8')

# Generate a 16-byte Initialization Vector (IV)
_IV = b'\00' * 16

# ID metadata
_VERSION = b'\01'
_LOCATION_PARTITION = b'\00\00\00\00\00\00\00'
_API_ID_PREFIX = _VERSION + _LOCATION_PARTITION

# Create a Cipher object using AES algorithm in CBC mode
cipher = Cipher(algorithms.AES(_ENC_KEY), modes.CBC(_IV), backend=default_backend())

log = logging.getLogger(__name__)


class IdType(Enum):
    """Type enum for ID prefixes"""
    PROFILE = 'prf'
    ORG = 'org'
    ASSET = "asset"
    FILE = "file"
    EVENT = 'evt'
    TOPO = 'topo'
    JOBDEF = 'jobdef'
    JOB = 'job'
    JOBRESULT = 'jobres'
    READER = 'read'
    TAG = 'tag'


class ApiError(Exception):
    def __init__(self, message):
        super().__init__(message)


class IdError(Exception):
    def __init__(self, id_str: str, reason: str):
        super().__init__(f'API ID {id_str} is not valid: {reason}')


class SequenceError(ApiError):
    def __init__(self, seq_num: int, reason: str):
        super().__init__(f'sequence number {seq_num} is not valid: {reason}')


id_rev_map = {i.value: i for i in list(IdType)}


class DbSeq(BaseModel):
    id_type: IdType
    prefix: bytes
    seq: int


def seq_to_id(api_type: IdType, seq: int | None) -> str:
    """Given a 64bit integer, return an encrypted version with a fixed HMAC"""
    if seq is None:
        raise SequenceError(0, "sequence is none")

    if type(seq) is not int:
        raise SequenceError(seq, f"invalid type {type(seq)}")

    # encrypt first 16 bytes (note this must be done in 128bit blocks or else padded)
    seq_bytes = seq.to_bytes(8, 'big')
    e = cipher.encryptor()
    encrypted = e.update(_API_ID_PREFIX + seq_bytes)
    if len(encrypted) != _ENCRYPTED_BYTES:
        raise SequenceError(seq, f"invalid encrypted length {len(encrypted)}")

    h = hashlib.blake2b(digest_size=DIGEST_SIZE, key=_HMAC_KEY, person=_PERSON)
    h.update(encrypted)
    digest = h.digest()
    combined = encrypted + digest[0:_HMAC_BYTES]
    encoded = base58.b58encode(combined)

    return ''.join((api_type.value, '_', encoded.decode('utf-8')))


def id_type(api_id: str) -> IdType:
    """Return the ID type from the API ID"""
    if type(api_id) is not str:
        raise IdError(api_id, f"invalid api id type {type(api_id)}")

    parts = api_id.split('_')
    if len(parts) != 2:
        raise IdError(api_id, f"invalid api id format {api_id}")

    type_str, api_id = parts
    return id_rev_map[type_str]


def id_to_seq(api_id: str, api_id_type: IdType) -> int:
    """Validate and decode an encrypted serial number"""
    if type(api_id) is not str:
        raise IdError(api_id, f"IDs must be of string type: {type(api_id)}")

    parts = api_id.split('_')
    if len(parts) != 2:
        raise IdError(api_id, f"ID has invalid format: {api_id}")

    type_str, api_id = parts
    if api_id_type != id_rev_map.get(type_str):
        raise IdError(api_id, f"ID has invalid type: {type_str}")

    # Base58 decode the obfuscated serial number
    combined = base58.b58decode(api_id)

    # Extract the encrypted serial number and HMAC
    encrypted: bytes = combined[0:_ENCRYPTED_BYTES]
    serial_hmac = combined[_ENCRYPTED_BYTES:]
    if len(serial_hmac) != _HMAC_BYTES:
        raise IdError(api_id, "HMAC byte count mismatch")

    # Verify the HMAC
    h = hashlib.blake2b(digest_size=DIGEST_SIZE, key=_HMAC_KEY, person=_PERSON)
    h.update(encrypted)
    digest = h.digest()
    if not hmac.compare_digest(serial_hmac, digest[0:_HMAC_BYTES]):
        raise IdError(api_id, "Invalid HMAC - data may have been tampered with")

    # Decrypt the serial number
    d = cipher.decryptor()
    decrypted_data = d.update(encrypted)
    prefix = decrypted_data[0:_PREFIX_BYTES]
    seq = decrypted_data[_PREFIX_BYTES:]
    if len(seq) != _SEQ_BYTES:
        raise IdError(api_id, f"Invalid sequence bytes {len(seq)}")

    if prefix != _API_ID_PREFIX:
        raise IdError(api_id, f"ID has invalid prefix: {prefix}")

    return int.from_bytes(seq, 'big')


def asset_seq_to_id(asset_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.ASSET, asset_seq)


def asset_id_to_seq(asset_id: str) -> int:
    """Convert asset ID to encrypted seq"""
    return id_to_seq(asset_id, IdType.ASSET)


def profile_seq_to_id(profile_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.PROFILE, profile_seq)


def profile_id_to_seq(profile_id: str) -> int:
    """Convert asset ID to encrypted seq"""
    return id_to_seq(profile_id, IdType.PROFILE)


def org_seq_to_id(org_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.ORG, org_seq)


def org_id_to_seq(org_id: str) -> int | None:
    """Convert asset ID to encrypted seq"""
    return id_to_seq(org_id, IdType.ORG)


def file_seq_to_id(file_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.FILE, file_seq)


def file_id_to_seq(file_id: str) -> int:
    """Convert asset ID to encrypted seq"""
    return id_to_seq(file_id, IdType.FILE)


def event_seq_to_id(file_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.EVENT, file_seq)


def event_id_to_seq(file_id: str) -> int:
    """Convert asset ID to encrypted seq"""
    return id_to_seq(file_id, IdType.EVENT)


def topo_seq_to_id(topo_seq: int) -> str:
    """Convert asset seq to ID"""
    return seq_to_id(IdType.TOPO, topo_seq)


def topo_id_to_seq(topo_id: str) -> int:
    """Convert asset ID to encrypted seq"""
    return id_to_seq(topo_id, IdType.TOPO)


def job_def_seq_to_id(job_def_seq: int) -> str:
    """Convert job def seq to ID"""
    return seq_to_id(IdType.JOBDEF, job_def_seq)


def job_def_id_to_seq(job_def_id: str) -> int:
    """Convert job def ID to encrypted seq"""
    return id_to_seq(job_def_id, IdType.JOBDEF)


def job_seq_to_id(job_seq: int) -> str:
    """Convert job seq to ID"""
    return seq_to_id(IdType.JOB, job_seq)


def job_id_to_seq(job_id: str) -> int:
    """Convert job ID to encrypted seq"""
    return id_to_seq(job_id, IdType.JOB)


def job_result_seq_to_id(job_result_seq: int) -> str:
    """Convert job result seq to ID"""
    return seq_to_id(IdType.JOBRESULT, job_result_seq)


def job_result_id_to_seq(job_result_id: str) -> int:
    """Convert job result ID to encrypted seq"""
    return id_to_seq(job_result_id, IdType.JOBRESULT)


def reader_seq_to_id(reader_seq: int) -> str:
    """Convert reader  seq to encrypted ID"""
    return seq_to_id(IdType.READER, reader_seq)


def reader_id_to_seq(reader_id: str) -> int:
    """Convert reader ID to database seq"""
    return id_to_seq(reader_id, IdType.READER)


def tag_seq_to_id(tag_seq: int) -> str:
    """Convert tag seq to encrypted ID"""
    return seq_to_id(IdType.TAG, tag_seq)


def tag_id_to_seq(tag_id: str) -> int:
    """Convert tag ID to database seq"""
    return id_to_seq(tag_id, IdType.TAG)
