# pylint: disable=W0105:pointless-string-statement

from typing import Any, Callable, Literal, NamedTuple, Optional

from ripple.models.streaming import StreamItem


class Boundary(NamedTuple):
    """
    Boundary representing a position and a directionality of that position

    Position must be interpreted by the underlying source, it could be the index
    of a sequence "5312" or multipart index "151:1512" if iterating a composite index

    Position of None implies the beginning or current position of the sequence. Sequences
    that are non-indexed will not respect boundaries.

    The boundary is non-inclusive, that is the sequence after position does not include
    the element denoted by position.
    """
    position: Optional[str] = None
    direction: Literal['before', 'after'] = 'after'


"""
Source is a callable that takes an acknowledgement 'after' and a 
max item count and returns a list of next StreamItems from the source.

If the first 'after' parameter is not specified it is assumed to be the
beginning of the current head of the stream items that are available.
"""
Source = Callable[[Boundary], list[StreamItem]]

"""
Sink is a callable that takes a stream item and returns a boolean
indicating if the item could be written or not.
"""
Sink = Callable[[StreamItem], bool]

"""
SourceFactory is a callable that takes parameter map and returns 
a new source instance.
"""
SourceFactory = Callable[[dict[str, Any]], Source]
