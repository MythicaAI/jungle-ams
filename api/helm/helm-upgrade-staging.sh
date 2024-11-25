#!/usr/bin/env bash

# Upgrade the Helm chart with version information in the description
helm upgrade --namespace api-staging -f api/helm/api/values-staging.yaml -f api/helm/api/values-images.yaml api-staging api/helm/api || {
    echo "Helm upgrade failed"
    exit 1
}

kubectl rollout restart deployment/app -n api-staging
kubectl rollout restart deployment/packager -n api-staging
kubectl rollout restart deployment/lets-encrypt -n api-staging
kubectl rollout restart deployment/gcs-proxy -n api-staging
kubectl rollout restart deployment/canary -n api-staging
kubectl rollout restart deployment/web-front -n api-staging
