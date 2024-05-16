#!/usr/bin/env bash
USER=postgres
PASSWORD=test
DATABASE=upload_pipeline


psql -U $USER -d $DATABASE -f sql/bootstrap_upload_pipeline.sql
