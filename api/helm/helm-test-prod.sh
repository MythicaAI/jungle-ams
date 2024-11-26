#!/usr/bin/env bash
helm template --namespace api-staging \
    -f api/values.yaml \
    -f api/values-images.yaml \
    --debug ./api
