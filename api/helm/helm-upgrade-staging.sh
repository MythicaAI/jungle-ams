#!/usr/bin/env bash

./api/helm/helm-generate-version-values.sh 

# Upgrade the Helm chart
helm upgrade --namespace api-staging -f api/helm/api/values-staging.yaml \
    -f api/helm/api/values-images.yaml api-staging api/helm/api


kubectl rollout restart deployment/app -n api-staging
kubectl rollout restart deployment/packager -n api-staging
kubectl rollout restart deployment/web-front -n api-staging
