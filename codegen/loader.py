import os
from pathlib import Path
from typing import Dict, Any

import yaml
import jsonschema
import logging

from jsonschema.validators import Draft202012Validator

log = logging.getLogger(__name__)

ASSETS = "schema-assets.yaml"
EVENTS = "schema-events.yaml"
MEDIA = "schema-media.yaml"
PROFILE = "schema-profiles.yaml"
SCHEMA = "meta-schema.json"


def load_path(input_path: Path) -> Dict[str, Any]:
    self_path = os.path.abspath(os.path.dirname(os.path.abspath(__file__)))

    with open(os.path.join(self_path, SCHEMA), "rb") as schema_file:
        schema = yaml.safe_load(schema_file)

    with open(str(input_path), 'rb') as f:
        yaml_data = yaml.safe_load(f)
        # Validate YAML data against JSON schema
        try:
            v = Draft202012Validator(schema)
            errors = sorted(v.iter_errors(yaml_data), key=lambda e: e.path)
            for error in errors:
                log.error(f"{str(input_path)}: {str(error)}")
            if len(errors) > 0:
                return {}

            log.info(f"YAML file: {input_path} is valid.")
        except jsonschema.exceptions.SchemaError as e:
            log.exception(e)
        except jsonschema.exceptions.ValidationError as e:
            log.exception(e)
        return yaml_data


def load_name(name: str) -> Dict[str, Any]:
    """
    See loader.* name constants
    """
    self_path = os.path.abspath(os.path.dirname(os.path.abspath(__file__)))
    input_path = Path(self_path, name)
    return load_path(input_path)

def load_all() -> Dict[str, Any]:
    names = {ASSETS, EVENTS, MEDIA, PROFILE}
    for name in names:
        load_name(name)