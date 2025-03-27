#!/usr/bin/env bash

# Upgrade the Helm chart with version information in the description
helm upgrade --namespace automation-staging \
    -f ./values-staging.yaml \
    -f ./values-images.yaml automation-staging ./ || {
    echo "Helm upgrade failed"
    exit 1
}

kubectl rollout restart deployment/houdini -n automation-staging
kubectl rollout restart deployment/imagemagick -n automation-staging
