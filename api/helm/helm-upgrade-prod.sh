#!/usr/bin/env bash

kubectl config use-context gke_controlnet-407314_us-central1_gke-main-us-central1
# Upgrade the Helm chart with version information in the description
helm upgrade --namespace api -f api/values.yaml -f api/values-images.yaml api ./api || {
    echo "Helm upgrade failed"
    exit 1
}

kubectl rollout restart deployment/app -n api
kubectl rollout restart deployment/packager -n api
kubectl rollout restart deployment/lets-encrypt -n api
kubectl rollout restart deployment/gcs-proxy -n api
kubectl rollout restart deployment/web-front -n api
