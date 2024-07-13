import json
from pathlib import Path
from typing import Any

import chevron


def schema_to_sqlmodel(schema: dict[str, Any]) -> str:
    """Convert schema document to SQL model"""

    def nullable_str(c) -> str:
        if 'nullable' in c and c.get('nullable') is False:
            return "nullable=False"
        return "nullable=True"

    def primary_key_props() -> [str]:
        return ["primary_key=True", "nullable=False"]

    def foreign_key_props(c) -> [str]:
        return [f"foreign_key=\'{c['foreign_key']}\'", "default=None"]

    def default_prop(value_str) -> [str]:
        if value_str is None:
            return []
        return [f"default={value_str}"]

    def datestamp_str(c) -> str:
        return "server_default = 'text(\"(now() AT TIME ZONE \'UTC\')\")'"

    def autoupdate_timestamp_props(c) -> list[str]:
        # return "Field(default=None, sa_type=TIMESTAMP(timezone=True), sa_column_kwargs={\'onupdate\': func.now(), \'nullable\': True})"
        # return "Field(default=None, sa_type=TIMESTAMP(timezone=True), sa_column_kwargs={\'server_default\': text(\'NULL ON UPDATE CURRENT_TIMESTAMP\'), \'nullable\': True})"
        return [
            'default=None',
            'sa_type=TIMESTAMP(timezone=True)',
            'sa_column_kwargs={\'server_onupdate\': sql_now(), \'nullable\': True}']

    def autocreate_timestamp_props(c) -> list[str]:
        # return "Field(sa_type=TIMESTAMP(timezone=True), sa_column_kwargs={\'server_default\': text(\'CURRENT_TIMESTAMP\')}, nullable=False)"
        return [
            'sa_type=TIMESTAMP(timezone=True)',
            'sa_column_kwargs={\'server_default\': sql_now(), \'nullable\': False}']

    def autocreate_uuid_props(c) -> [str]:
        return ["default_factory=uuid4"]

    def validate_field_props(c, fp):
        fp_seen = {}
        for prop in fp:
            parts = prop.split('=', maxsplit=1)
            assert len(parts) == 2
            if parts[0] in fp_seen:
                raise ValueError(f"Column {json.dumps(c)}, duplicate fields '{prop}' '{fp_seen[parts[0]]}'")
            fp_seen[parts[0]] = prop

    py_types = {
        "UUID": ('UUID', 'uuid4()'),
        "INTEGER": ('int', '0'),
        "BIGINT": ('int', '0'),
        "TEXT": ('str', 'None'),
        "REAL": ('float', '0.0'),
        "BLOB": ('bytes', 'bytes()'),
        "BOOLEAN": ('bool', 'False'),
        "DATE": ('datetime', 'None'),
        "TIMESTAMP": ('datetime', 'None'),
        "JSON": ('Dict[str, Any]', 'None'),
    }

    def get_py_type(c):
        """Get the python type of the column"""
        return py_types[c['type']]

    for table in schema["tables"]:
        for column in table["columns"]:
            primary_key = column.get("primary_key")
            foreign_key = column.get("foreign_key")
            nullable = column.get("nullable")
            py_type, py_value = get_py_type(column)

            # primary keys are default not nullable
            is_primary_key = primary_key is not None and primary_key
            if is_primary_key:
                nullable = False

            # Handle the python type decoration based on type and nullability
            # nullable is the default
            if nullable is None or nullable is True:
                column["py_type"] = f"{py_type} | None"
            else:
                column["py_type"] = py_type

            field_props = []
            if primary_key:
                field_props.extend(primary_key_props())
            elif foreign_key:
                field_props.extend(foreign_key_props(column))

            is_auto_create = column.get('auto_create') is not None
            if column['type'] == 'UUID' and (is_primary_key or is_auto_create):
                field_props.extend(autocreate_uuid_props(column))

            if column['type'] == 'JSON':
                field_props.extend(['default_factory=dict', 'sa_column=Column(JSON)'])

            if 'max_length' in column:
                field_props.extend(['max_length={0}'.format(column['max_length'])])

            if column['type'] == 'DATETIME' or column['type'] == 'TIMESTAMP':
                if column.get('auto_update'):
                    field_props.extend(autoupdate_timestamp_props(column))
                elif column.get('auto_create'):
                    field_props.extend(autocreate_timestamp_props(column))

            # add default if not yet populated
            has_default = any(filter(lambda fp: fp.startswith('default'), field_props))
            if not has_default:
                field_props.extend(default_prop(py_value))

            # validate the field properties before rendering them
            validate_field_props(column, field_props)

            column['sqlmodel'] = 'Field(' + ','.join(field_props) + ')'

    template_file = Path(__file__).parent / Path('sqlmodel.mustache')
    with template_file.open() as f:
        template = f.read()
    return chevron.render(template, schema)
