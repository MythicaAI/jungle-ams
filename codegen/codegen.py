import logging
import os
import sys

from loader import ASSETS, EVENTS, GRAPH, JOBS, MEDIA, PROFILE, STREAMING, TAGS, load_name
from to_python import schema_to_sqlmodel
from to_typescript import schema_to_typescript

log = logging.getLogger(__name__)


def main():
    """
    Generate both SQLModel and TypeScript outputs.

    SQLModel schemas are generated in tree
    TypeScript models are generated out of tree
    """
    self_path = os.path.dirname(os.path.abspath(__file__))
    py_output = os.path.join(self_path, '..', 'api', 'app', 'db', 'schema')
    ts_output = os.path.join(self_path, '..', 'sites',
                             'jungle3', 'src', 'schema_types')

    os.makedirs(py_output, exist_ok=True)
    os.makedirs(ts_output, exist_ok=True)

    def fixup(fp, ext):
        """Fixup the file path to generate the new name.extension"""
        fp = fp.replace('schema-', '')
        fp = fp.replace('.yaml', ext)
        return fp

    for n in ASSETS, EVENTS, MEDIA, PROFILE, GRAPH, JOBS, STREAMING, TAGS:
        log.info(f"load schema {n}")
        schema = load_name(n)
        file_path = fixup(os.path.join(py_output, n), '.py')
        log.info(f'PY Generating {n} {file_path}')
        py_content = schema_to_sqlmodel(schema)
        with open(file_path, 'w+', encoding='utf-8') as f:
            f.write(py_content)

        file_path = fixup(os.path.join(ts_output, n), '.ts')
        log.info(f"TS generating {n} {file_path}")
        ts_content = schema_to_typescript(schema)
        # with open(file_path, 'w+', encoding='utf-8') as f:
        # f.write(ts_content)


if __name__ == '__main__':
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[logging.StreamHandler(sys.stdout)]
    )
    main()
