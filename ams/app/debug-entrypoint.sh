#!/bin/sh

# Run DB migration to ensure database is at latest revision
poetry run alembic upgrade head


poetry run uvicorn main:app --host 0.0.0.0 --port 5555
