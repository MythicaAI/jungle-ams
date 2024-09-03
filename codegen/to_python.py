import json
from pathlib import Path
from typing import Any

import chevron

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

sa_int_types = {
    'INTEGER': 'Integer',
    'BIGINT': 'BigInteger',
}


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


def timestamp_props(c) -> list[str]:
    return ['sa_type=TIMESTAMP(timezone=True)']


def autocreate_uuid_props(c) -> [str]:
    return ["default_factory=uuid4"]


def sa_sequence_name(table, c):
    table_name = table['table_name']
    col_name = c['name']
    return f"{table_name}_{col_name}_seq"


def sa_sequence_def(table, c, is_auto_update):
    seq_name = sa_sequence_name(table, c)
    if is_auto_update:
        table.setdefault('sequences', []).append(
            {'name': seq_name,
             'py_sequence_def': f"Sequence(name='{seq_name}', start=1)"})


def sa_column_props(table, c, sa_col_type, is_primary_key, is_auto_update) -> [str]:
    return filter(lambda x: x, [
        f"'{c['name']}'",
        sa_col_type,
        sa_sequence_name(table, c) if is_auto_update else "",
        f"primary_key={is_primary_key}" if is_primary_key else ""])


def validate_field_props(c, fp):
    fp_seen = {}
    for prop in fp:
        parts = prop.split('=', maxsplit=1)
        assert len(parts) == 2
        if parts[0] in fp_seen:
            raise ValueError(f"Column {json.dumps(c)}, duplicate fields '{prop}' '{fp_seen[parts[0]]}'")
        fp_seen[parts[0]] = prop


def get_py_type(c):
    """Get the python type of the column"""
    return py_types[c['type']]


def get_sa_int_type(sql_type):
    """Get the underlying SQLAlchemy integer type for the SQL int type"""
    return sa_int_types[sql_type]


def schema_to_sqlmodel(schema: dict[str, Any]) -> str:
    """Convert schema document to SQL model"""
    for table in schema["tables"]:
        for column in table["columns"]:
            primary_key = column.get("primary_key", None)
            foreign_key = column.get("foreign_key", None)
            nullable = column.get("nullable", True)
            is_auto_create = column.get('auto_create', False)
            is_auto_update = column.get('auto_update', False)
            sql_type = column['type']
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

            if sql_type == 'UUID' and (is_primary_key or is_auto_create):
                field_props.extend(autocreate_uuid_props(column))

            if sql_type == 'JSON':
                field_props.extend(['default_factory=dict', 'sa_column=Column(JSON)'])

            if 'max_length' in column:
                field_props.extend(['max_length={0}'.format(column['max_length'])])

            # special handling for date types to allow for automatic population of UTC timestamps
            if sql_type == 'DATETIME' or sql_type == 'TIMESTAMP':
                if is_auto_update:
                    field_props.extend(autoupdate_timestamp_props(column))
                elif is_auto_create:
                    field_props.extend(autocreate_timestamp_props(column))
                else:
                    field_props.extend(timestamp_props(column))

            # special handling for integers including composite key specification and integer
            # sizing requires dropping down to the SQLAlchemy base types
            if sql_type == 'BIGINT' or sql_type == 'INTEGER':
                sa_sequence_def(table, column, is_auto_update)
                sa_int_type = get_sa_int_type(sql_type)
                field_props = \
                    [f"sa_column=Column({','.join(
                        sa_column_props(table, column, sa_int_type, is_primary_key, is_auto_update))})"]

            # add default if not yet populated and field is not a primary key
            has_default = any(filter(lambda fp: fp.startswith('default'), field_props))
            if not has_default and not is_primary_key:
                field_props.extend(default_prop(py_value))

            # validate the field properties before rendering them
            validate_field_props(column, field_props)

            column['sqlmodel'] = 'Field(' + ','.join(field_props) + ')'

    template_file = Path(__file__).parent / Path('sqlmodel.mustache')
    with template_file.open() as f:
        template = f.read()
    return chevron.render(template, schema)
