from typing import Iterator, Optional

from pydantic import BaseModel

from encoder_cbor import Encoder  # Import the encoder module you provided


def encode_pydantic_model(
        encoder: Encoder,
        model: BaseModel,
        entity_type: str = None,
        name: Optional[str] = None,
        depth: int = 0,
        include_model_type: bool = True
) -> Iterator[bytes]:
    """
    Encodes a Pydantic BaseModel using the provided Encoder.

    Args:
        encoder: The Encoder instance to use for encoding
        model: The Pydantic BaseModel to encode
        entity_type: The entity type to use (defaults to model class name if None)
        name: Optional name for the BEGIN frame (defaults to model class name if None)
        depth: The depth value for BEGIN/END frames
        include_model_type: Whether to include the model type as an attribute

    Returns:
        Iterator of encoded bytes
    """
    # Use model class name as default entity_type and name if not provided
    if entity_type is None:
        entity_type = model.__class__.__name__

    if name is None:
        name = model.__class__.__name__

    # Begin the entity
    yield from encoder.begin(entity_type, name, depth)

    # Include the model type as an attribute if requested
    if include_model_type:
        yield from encoder.attr("_type", "string", model.__class__.__name__)

    # Convert model to dict using Pydantic's model_dump method
    # (or model_dump_json for newer Pydantic versions)
    try:
        # For Pydantic v2+
        model_data = model.model_dump(mode='python')
    except AttributeError:
        try:
            # For Pydantic v1
            model_data = model.dict()
        except AttributeError:
            # Fallback for custom implementations
            model_data = model.__dict__

    # Encode each attribute
    for attr_name, attr_value in model_data.items():
        # Skip private attributes (those starting with underscore)
        if attr_name.startswith('_'):
            continue

        # Determine attribute type based on value
        if isinstance(attr_value, str):
            attr_type = "string"
        elif isinstance(attr_value, bool):
            attr_type = "boolean"
        elif isinstance(attr_value, int):
            attr_type = "integer"
        elif isinstance(attr_value, float):
            attr_type = "float"
        elif attr_value is None:
            attr_type = "null"
        elif isinstance(attr_value, list) or isinstance(attr_value, tuple):
            attr_type = "array"
        elif isinstance(attr_value, dict):
            attr_type = "map"
        elif isinstance(attr_value, BaseModel):
            # Recursively encode nested Pydantic models
            yield from encode_pydantic_model(
                encoder,
                attr_value,
                entity_type=f"{entity_type}.{attr_name}",
                name=attr_name,
                depth=depth + 1
            )
            continue  # Skip regular attribute encoding for nested models
        else:
            # Try to convert other types to a basic type, otherwise use string representation
            attr_type = "string"
            attr_value = str(attr_value)

        # Encode the attribute
        yield from encoder.attr(attr_name, attr_type, attr_value)

    # End the entity
    yield from encoder.end(depth)


# Example usage:
"""
from pydantic import BaseModel
from encoder import Encoder

class Person(BaseModel):
    name: str
    age: int
    is_active: bool

class Team(BaseModel):
    team_name: str
    leader: Person
    members: list[Person]

# Create encoder
encoder = Encoder()

# Create models
alice = Person(name="Alice", age=30, is_active=True)
bob = Person(name="Bob", age=25, is_active=False)
team = Team(team_name="Engineering", leader=alice, members=[alice, bob])

# Encode the team model
encoded_frames = list(encode_pydantic_model(encoder, team))

# Send the encoded frames
for frame in encoded_frames:
    # Example: send frame over a socket
    socket.send(frame)
"""
