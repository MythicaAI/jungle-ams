import pytest

from bytestream_iterator import ByteStreamIterator


@pytest.fixture
def empty_data():
    return []


@pytest.fixture
def single_byte():
    return [b'a']


@pytest.fixture
def multi_bytes():
    return [b'hello', b'world']


def test_init_validation():
    """Test initialization validation"""
    with pytest.raises(ValueError):
        ByteStreamIterator([], buffer_size=-1)

    with pytest.raises(ValueError):
        ByteStreamIterator([], buffer_size='not an int')


def test_empty_chunks():
    """Test handling of empty chunks"""
    stream = ByteStreamIterator([b'', b'data', b'', b'more'])
    assert stream.read() == b'datamore'


def test_buffer_compaction():
    """Test buffer compaction with large reads"""
    chunk_size = 1000
    num_chunks = 20
    read_chunks = 15

    # Create large chunks that will trigger compaction
    chunks = [b'x' * chunk_size for _ in range(num_chunks)]
    total_size = chunk_size * num_chunks
    stream = ByteStreamIterator(chunks, buffer_size=1024)

    # Read in small chunks to fill buffer
    read_data = b''
    for _ in range(read_chunks):
        chunk = stream.read(chunk_size)
        assert len(chunk) == chunk_size
        read_data += chunk

    # Verify read data
    assert len(read_data) == chunk_size * read_chunks

    # Verify remaining data
    remaining = stream.read()
    expected_remaining = chunk_size * (num_chunks - read_chunks)
    assert len(remaining) == expected_remaining
    assert remaining == b'x' * expected_remaining

    # Verify total data consistency
    assert len(read_data + remaining) == total_size
    assert read_data + remaining == b'x' * total_size


def test_resource_cleanup():
    """Test proper resource cleanup and behavior after closing"""
    stream = ByteStreamIterator([b'data'])

    # Read some data before closing
    assert stream.read(2) == b'da'

    # Close the stream
    stream.close()

    # Verify closed state
    assert stream.closed

    # Reading after close should return empty bytes
    assert stream.read() == b''
    assert stream.read(100) == b''
    assert stream.read(-1) == b''
    assert stream.read(0) == b''

    # Multiple closes should not raise errors
    stream.close()

    # Verify internal state
    assert stream._exhausted
    assert stream._buffer is None
    assert not list(stream._iterator)


def test_large_reads_performance():
    """Test performance with large reads"""
    # Create large dataset
    large_chunks = [b'x' * 1024 for _ in range(1000)]
    stream = ByteStreamIterator(large_chunks, buffer_size=8192)

    # Read in various sizes
    sizes = [1024, 4096, 8192, 16384]
    for size in sizes:
        chunk = stream.read(size)
        assert len(chunk) == size
        assert chunk == b'x' * size


def test_mixed_chunk_types():
    """Test handling of invalid chunk types"""
    stream = ByteStreamIterator(['not bytes', b'valid'])
    with pytest.raises(TypeError):
        stream.read()


@pytest.mark.parametrize("buffer_size", [1, 10, 100, 1000])
def test_different_buffer_sizes(buffer_size):
    """Test behavior with different buffer sizes"""
    data = [b'chunk' * i for i in range(1, 5)]
    stream = ByteStreamIterator(data, buffer_size=buffer_size)
    assert stream.read() == b''.join(data)


def test_partial_reads_with_empty_chunks():
    """Test partial reads with empty chunks interspersed"""
    chunks = [b'', b'hello', b'', b'', b'world', b'']
    stream = ByteStreamIterator(chunks)

    assert stream.read(5) == b'hello'
    assert stream.read(5) == b'world'
    assert stream.read(5) == b''
