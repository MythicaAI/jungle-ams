#!/usr/bin/env bash

# Define version paths
VERSION_APP_PATH="api/app/VERSION_APP"
VERSION_FRONT_PATH="sites/VERSION_FRONT"

# Read the versions from the files
APP_VERSION=$(cat "$VERSION_APP_PATH")
FRONT_VERSION=$(cat "$VERSION_FRONT_PATH")

# Upgrade the Helm chart with version information in the description
helm upgrade --namespace api -f api/helm/api/values.yaml api api/helm/api \
  --description "Versions: back: $APP_VERSION, web-front: $FRONT_VERSION"

kubectl rollout restart deployment/app -n api
kubectl rollout restart deployment/packager -n api
kubectl rollout restart deployment/web-front -n api
