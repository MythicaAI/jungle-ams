from dataclasses import Field
from pathlib import Path
from typing import Dict, Any

import chevron


def schema_to_sqlmodel(schema: Dict[str, Any]) -> str:
    def nullable_str(c) -> str:
        if 'nullable' in c and c.get('nullable') is False:
            return "nullable=False"
        return "nullable=True"

    def primary_key_str(c) -> str:
        field_props = filter(lambda x: x, ["primary_key=True", "nullable=False"])
        return f"Field({", ".join(field_props)})"

    def foreign_key_str(c) -> str:
        return f"Field(foreign_key=\'{c['foreign_key']}\')"

    def datestamp_str(c) -> str:
        return "server_default = 'text(\"(now() AT TIME ZONE \'UTC\')\")'"

    def autoupdate_timestamp_str(c) -> str:
        #return "Field(default=None, sa_type=TIMESTAMP(timezone=True), sa_column_kwargs={\'onupdate\': func.now(), \'nullable\': True})"
        #return "Field(default=None, sa_type=TIMESTAMP(timezone=True), sa_column_kwargs={\'server_default\': text(\'NULL ON UPDATE CURRENT_TIMESTAMP\'), \'nullable\': True})"
        return "Field(default=None, sa_type=TIMESTAMP(timezone=True), sa_column_kwargs={\'server_onupdate\': sql_now(), \'nullable\': True})"

    def autocreate_timestamp_str(c) -> str:
        #return "Field(sa_type=TIMESTAMP(timezone=True), sa_column_kwargs={\'server_default\': text(\'CURRENT_TIMESTAMP\')}, nullable=False)"
        return "Field(sa_type=TIMESTAMP(timezone=True), sa_column_kwargs={\'server_default\': sql_now(), \'nullable\': False})"

    def autocreate_uuid_str(c) -> str:
        is_pk = c.get('primary_key', False)
        is_nullable = not is_pk and c.get('nullable', True)
        fields = [f"primary_key={is_pk}",
                  "default_factory=uuid4",
                  f"nullable={is_nullable}"]
        return f"Field({', '.join(fields)})"

    py_types = {
        "UUID": ('UUID', 'uuid4()'),
        "INTEGER": ('int', '0'),
        "TEXT": ('str', 'None'),
        "REAL": ('float', '0.0'),
        "BLOB": ('bytes', 'bytes()'),
        "BOOLEAN": ('bool', 'False'),
        "DATE": ('datetime', 'None'),
        "TIMESTAMP": ('datetime', 'None'),
        "JSON": ('Dict[str, Any]', 'None'),
    }

    def get_py_type(c):
        return py_types[c['type']]

    for table in schema["tables"]:
        for column in table["columns"]:
            primary_key = column.get("primary_key")
            foreign_key = column.get("foreign_key")
            nullable = column.get("nullable")
            py_type, py_value = get_py_type(column)

            if primary_key is not None and primary_key:
                nullable = False

            # Handle the python type decoration based on type and nullability
            # nullable is the default
            if nullable is None or nullable is True:
                column["py_type"] = f"{py_type} | None"
            else:
                column["py_type"] = py_type

            if primary_key:
                column['sqlmodel'] = primary_key_str(column)
            elif foreign_key:
                column['sqlmodel'] = foreign_key_str(column)
            else:
                column['sqlmodel'] = py_value

            if column['type'] == 'UUID' and column.get('auto_create') is not None:
                column['sqlmodel'] = autocreate_uuid_str(column)

            if column['type'] == 'JSON':
                column['sqlmodel'] = "Field(default_factory=dict, sa_column=Column(JSON))"

            if column['type'] == 'DATETIME' or column['type'] == 'TIMESTAMP':
                if column.get('auto_update'):
                    column['sqlmodel'] = autoupdate_timestamp_str(column)
                elif column.get('auto_create'):
                    column['sqlmodel'] = autocreate_timestamp_str(column)

    template_file = Path(__file__).parent / Path('sqlmodel.mustache')
    with template_file.open() as f:
        template = f.read()
    return chevron.render(template, schema)
