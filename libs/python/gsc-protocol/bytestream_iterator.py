from io import BytesIO
from typing import Iterable


class ByteStreamIterator:
    def __init__(self, iterator: Iterable[bytes], buffer_size: int = 8192):
        if not isinstance(buffer_size, int) or buffer_size < 0:
            raise ValueError("buffer_size must be a non-negative integer")
        self._iterator = iter(iterator)
        self._buffer = BytesIO()
        self._buffer_size = buffer_size
        self._exhausted = False

    def read(self, size: int = -1) -> bytes:
        if self._buffer is None:  # Stream is closed
            return b""

        if size < -1:
            raise ValueError("size must be -1 or non-negative")

        if size == 0:
            return b""

        # For full reads, consume the entire iterator
        if size == -1:
            data = []
            # First get any remaining data in buffer
            self._buffer.seek(0)
            buffer_data = self._buffer.read()
            if buffer_data:
                data.append(buffer_data)

            # Then exhaust the iterator
            try:
                while True:
                    chunk = next(self._iterator)
                    if not isinstance(chunk, bytes):
                        raise TypeError(f"Iterator must yield bytes, got {type(chunk)}")
                    if chunk:  # Skip empty chunks
                        data.append(chunk)
            except StopIteration:
                pass

            self._exhausted = True
            self._buffer = BytesIO()  # Reset buffer
            return b"".join(data)

        # For fixed-size reads
        result = []
        bytes_needed = size

        # First read from buffer
        self._buffer.seek(0)
        buffer_data = self._buffer.read()
        if buffer_data:
            result.append(buffer_data[:bytes_needed])
            if len(buffer_data) > bytes_needed:
                # Put excess back in buffer
                self._buffer = BytesIO()
                self._buffer.write(buffer_data[bytes_needed:])
                return b"".join(result)
            bytes_needed -= len(buffer_data)

        # If we still need more bytes, read from iterator
        self._buffer = BytesIO()  # Clear old buffer
        while bytes_needed > 0 and not self._exhausted:
            try:
                chunk = next(self._iterator)
                if not isinstance(chunk, bytes):
                    raise TypeError(f"Iterator must yield bytes, got {type(chunk)}")
                if not chunk:  # Skip empty chunks
                    continue

                if len(chunk) <= bytes_needed:
                    result.append(chunk)
                    bytes_needed -= len(chunk)
                else:
                    # Split chunk
                    result.append(chunk[:bytes_needed])
                    self._buffer.write(chunk[bytes_needed:])
                    bytes_needed = 0
            except StopIteration:
                self._exhausted = True
                break

        return b"".join(result)

    def close(self) -> None:
        """Close the stream and release resources."""
        if self._buffer is not None:
            self._buffer.close()
            self._buffer = None
        self._iterator = iter(())
        self._exhausted = True

    @property
    def closed(self) -> bool:
        """Return True if the stream is closed."""
        return self._buffer is None
