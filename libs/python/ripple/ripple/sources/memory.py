from typing import Any, Dict, List

from ripple.funcs import Boundary, Source
from ripple.models.streaming import StreamItem


def create_memory_source(source: List[Any], params: Dict[str, Any]) -> Source:
    """Create an in-memory source"""
    page_size = params.get('page_size', 1)

    def memory_source(boundary: Boundary) -> List[StreamItem]:
        """
        Generates a partial list of results based on the boundary and direction.

        Parameters:
        - data_list (List[Any]): The original list of data.
        - boundary (Boundary): The boundary value and direction.
        - page_size (int): The maximum number of items to return.

        Returns:
        - List[Any]: A list containing up to 'page_size' elements.
        """
        if not source:
            return []

        if boundary.position is None:
            if boundary.direction == 'after':
                # Start from the beginning of the list
                return source[:page_size]
            elif boundary.direction == 'before':
                # Start from the end of the list
                return source[-page_size:]
            else:
                raise ValueError("Invalid direction; must be 'before' or 'after'.")

        if boundary.direction == 'after':
            # Get elements after the position
            start_index = int(boundary.position) + 1
            end_index = start_index + page_size
            return source[start_index:end_index]
        elif boundary.direction == 'before':
            # Get elements before the boundary value
            end_index = int(boundary.position) - 1
            start_index = max(0, end_index - page_size)
            return source[start_index:end_index]
        else:
            raise ValueError("Invalid direction; must be 'before' or 'after'.")

    return memory_source
