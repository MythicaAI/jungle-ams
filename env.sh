#!/usr/bin/env bash

if [[ ! -d .infra ]]; then
	python3 -m venv .infra
fi	

. .infra/bin/activate
pip install -r local_requirements.txt
echo "// .infra virtual env activated and updated, use 'deativate' to exit"
echo "// use 'invoke <task-name> [or] inv <task-name>' to get started..."
inv -l
