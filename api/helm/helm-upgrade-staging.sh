#!/usr/bin/env bash

kubectl config use-context gke_controlnet-407314_us-central1_gke-main-us-central1
# Upgrade the Helm chart with version information in the description
helm upgrade --namespace api-staging \
    -f ./api/values-staging.yaml \
    -f ./api/values-images.yaml api-staging ./api || {
    echo "Helm upgrade failed"
    exit 1
}

kubectl rollout restart deployment/app -n api-staging
kubectl rollout restart deployment/packager -n api-staging
kubectl rollout restart deployment/lets-encrypt -n api-staging
kubectl rollout restart deployment/gcs-proxy -n api-staging
kubectl rollout restart deployment/canary -n api-staging
kubectl rollout restart deployment/web-front -n api-staging
