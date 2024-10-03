#!/usr/bin/env bash
helm install --namespace api-staging -f api/values-staging.yaml api-staging ./api
