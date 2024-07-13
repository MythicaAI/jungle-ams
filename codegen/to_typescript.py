import logging
from pathlib import Path
from typing import Dict, Any

import chevron

log = logging.getLogger(__name__)


def schema_to_typescript(schema_doc: Dict[str, Any]) -> str:
    ts_defaults = {
        "UUID": ('string', ''),
        "INTEGER": ('number', '0'),
        "BIGINT": ('number', '0'),
        "TEXT": ('string', 'null'),
        "REAL": ('number', '0.0'),
        "BLOB": ('bytes', 'null'),
        "BOOLEAN": ('boolean', 'false'),
        "DATE": ('date', 'null'),
        "TIMESTAMP": ('string', 'null'),
        "JSON": ('object', 'null'),
    }
    default_value = ('any', 'null')

    def ts_type(column):
        type_str = column['type']
        ts_type_str = ts_defaults.get(type_str, default_value)[0]
        if ts_type_str == 'any':
            log.warning(f"unsupported typescript type: %s", type_str)
        return ts_type_str

    def ts_value(column):
        type_str = column['type']
        ts_value_str = ts_defaults.get(type_str, default_value)[1]
        return ts_value_str

    for table in schema_doc['tables']:
        for column in table['columns']:
            column["ts_type"] = ts_type(column)
            column["ts_value"] = ts_value(column)
    template_file = Path(__file__).parent / Path('typescript.mustache')
    with template_file.open() as f:
        template = f.read()
    return chevron.render(template, schema_doc)
