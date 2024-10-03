#!/usr/bin/env bash
helm upgrade --namespace api-staging -f api/values-staging.yaml api-staging ./api
