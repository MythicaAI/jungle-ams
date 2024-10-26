#!/usr/bin/env bash

source api/helm/add_tag_for_stable_versions.sh

# Upgrade the Helm chart with version information in the description
helm upgrade --namespace api -f api/helm/api/values.yaml api api/helm/api \
  --description "Versions: back: $APP_VERSION, web-front: $FRONT_VERSION" \
  --set image.tag="$NEW_TAG"

kubectl rollout restart deployment/app -n api
kubectl rollout restart deployment/packager -n api
kubectl rollout restart deployment/web-front -n api
