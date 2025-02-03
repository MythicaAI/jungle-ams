#!/usr/bin/env bash
kubectl config use-context gke_controlnet-407314_us-central1_gke-main-us-central1
helm template --namespace api-staging \
    -f api/values-staging.yaml \
    -f api/values-images.yaml \
    --debug ./api
