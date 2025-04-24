#!/bin/sh

python3 job_canary.py \
  --endpoint=${MYTHICA_ENDPOINT} \
  --api_key=${MYTHICA_API_KEY} $*