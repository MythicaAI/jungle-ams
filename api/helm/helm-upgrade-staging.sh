#!/usr/bin/env bash

# Define version paths
VERSION_APP_PATH="api/app/VERSION_APP"
VERSION_FRONT_PATH="sites/VERSION_FRONT"

# Read the versions from the files
APP_VERSION=$(cat "$VERSION_APP_PATH")
FRONT_VERSION=$(cat "$VERSION_FRONT_PATH")

if [[ -f "$VERSION_APP_PATH" && -f "$VERSION_FRONT_PATH" ]]; then
    APP_VERSION=$(cat "$VERSION_APP_PATH")
    FRONT_VERSION=$(cat "$VERSION_FRONT_PATH")
else
    echo "Version files not found!"
    exit 1
fi

# Upgrade the Helm chart with version information in the description
helm upgrade --namespace api-staging -f api/helm/api/values-staging.yaml api-staging api/helm/api \
  --description "Versions: back: $APP_VERSION, web-front: $FRONT_VERSION" || {
    echo "Helm upgrade failed"
    exit 1
}

helm upgrade otel-release-k8s-infra ./api/helm/otel -f ./api/helm/otel/override-values.yaml --namespace api-staging

kubectl rollout restart deployment/app -n api-staging
kubectl rollout restart deployment/packager -n api-staging
kubectl rollout restart deployment/web-front -n api-staging
kubectl rollout restart deployment/otel-agent -n api-staging
kubectl rollout restart deployment/otel-collector -n api-staging
