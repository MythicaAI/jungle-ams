import random

from auth.api_id import seq_to_id, id_to_seq, IdType


def test_round_trip():
    n = 1234567890123456789
    api_id = seq_to_id(IdType.PROFILE, n)
    seq = id_to_seq(api_id)
    assert seq.seq == n
    assert seq.id_type == IdType.PROFILE
    assert seq.prefix == b'\01\00\00\00\00\00\00\00'


def test_multiple():
    enum_values = list(IdType)
    sequences = [i for i in range(2 ^ 32, (2 ^ 32) + 10_000)]
    ids = [seq_to_id(random.choice(enum_values), seq)
           for seq in sequences]
    decoded = [id_to_seq(id) for id in ids]
    decoded_seqs = [seq.seq for seq in decoded]
    assert sequences == decoded_seqs
