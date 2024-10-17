#!/usr/bin/env bash
helm upgrade --namespace api-staging -f api/values-staging.yaml api-staging ./api

kubectl rollout restart deployment/app -n api-staging
kubectl rollout restart deployment/gcs-proxy -n api-staging
kubectl rollout restart deployment/lets-encrypt -n api-staging
kubectl rollout restart deployment/packager -n api-staging
kubectl rollout restart deployment/web-front -n api-staging
