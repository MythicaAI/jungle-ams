import random

import pytest

from gcid.gcid import IdError, IdType, SequenceError, id_to_seq, id_type, seq_to_id


def profile_id():
    """Generate a profile ID"""
    n = 1234567890123456789
    return n, seq_to_id(IdType.PROFILE, n)


def test_round_trip():
    n, api_id = profile_id()
    seq = id_to_seq(api_id, IdType.PROFILE)
    assert seq == n


def test_invalid_type():
    _, api_id = profile_id()
    api_id = api_id.replace("prf", "foo")
    with pytest.raises(IdError):
        id_to_seq(api_id, IdType.PROFILE)


def test_invalid_format():
    _, api_id = profile_id()
    api_id = api_id.replace("_", ":")
    with pytest.raises(IdError):
        id_to_seq(api_id, IdType.PROFILE)


def test_corrupt_id():
    _, api_id = profile_id()
    with pytest.raises(IdError):
        id_to_seq(api_id[0:len(api_id) - 1], IdType.PROFILE)


def test_invalid_seq():
    with pytest.raises(SequenceError):
        seq_to_id(IdType.PROFILE, None)


def test_multiple():
    enum_values = list(IdType)
    sequences = [i for i in range(2 ^ 32, (2 ^ 32) + 10_000)]
    ids = [seq_to_id(random.choice(enum_values), seq)
           for seq in sequences]
    decoded = [id_to_seq(id, id_type(id)) for id in ids]
    decoded_seqs = [seq for seq in decoded]
    assert sequences == decoded_seqs
