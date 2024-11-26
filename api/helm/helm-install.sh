#!/usr/bin/env bash

set -x

ENV=${1:-"staging"}

if [ $ENV == "staging" ]; then
  ENV="staging"
  ENV_EXT="-staging"
fi
if [ $ENV == "prod" ]; then
  ENV="prod"
  ENV_EXT=""
fi
if [ $ENV == "" ]; then
  echo "environment should be staging or prod"
  exit 1
fi

CMD="helm install --namespace api${ENV_EXT} -f api/values${ENV_EXT}.yaml -f api/values-images.yaml api${ENV_EXT} ./api"

# Prompt user for y/n
echo "Running: $CMD"
read -p "Do you want to run the command? (Y/n): " choice

if [ "${choice}" == 'Y' ]; then
    $CMD
fi
