from typing import Any, AsyncIterator, Dict, List

from meshwork.funcs import Boundary, Source
from meshwork.models.streaming import StreamItem


def create_memory_source(source: List[Any], params: Dict[str, Any]) -> Source:
    """Create an in-memory source"""
    page_size = params.get("page_size", 1)

    async def memory_source(boundary: Boundary) -> AsyncIterator[StreamItem]:
        """
        Generates a partial list of results based on the boundary and direction.

        Parameters:
        - data_list (List[Any]): The original list of data.
        - boundary (Boundary): The boundary value and direction.
        - page_size (int): The maximum number of items to return.

        Returns:
        - AsyncGenerator[StreamItem]: yields [0, page_size) items
        """
        # pylint: disable=F824
        nonlocal source
        if not source:
            return

        if boundary.position is None:
            if boundary.direction == "after":
                # Start from the beginning of the list
                for item in source[:page_size]:
                    yield item
            elif boundary.direction == "before":
                # Start from the end of the list
                for item in source[-page_size:]:
                    yield item
            else:
                raise ValueError("Invalid direction; must be 'before' or 'after'.")
            return  # from beginning, from end condition

        if boundary.direction == "after":
            # Get elements after the position
            start_index = int(boundary.position) + 1
            end_index = start_index + page_size
            for item in source[start_index:end_index]:
                yield item
        elif boundary.direction == "before":
            # Get elements before the boundary value
            end_index = int(boundary.position) - 1
            start_index = max(0, end_index - page_size)
            for item in source[start_index:end_index]:
                yield item
        else:
            raise ValueError("Invalid direction; must be 'before' or 'after'.")

    return memory_source
