#!/usr/bin/env bash

SERVICE_ACCOUNT_JSON=$(op read op://Infrastructure/front-end-api-staging-sa/service-account.json)

kubectl delete secret/front-end-api-staging-sa -n api-staging
kubectl create secret generic front-end-api-staging-sa \
  --from-literal=service-account.json="$SERVICE_ACCOUNT_JSON" \
  --namespace=api-staging