from typing import Any, Callable

from streaming.models import StreamItem

"""
Source is a callable that takes an acknowledgement 'after' and a 
max item count and returns a list of next StreamItems from the source.

If the first 'after' parameter is not specified it is assumed to be the
beginning of the current head of the stream items that are available.
"""
Source = Callable[[str, int], list[StreamItem]]

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
