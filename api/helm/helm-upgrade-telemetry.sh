#!/usr/bin/env bash

# there should be secret 
# kubectl create secret generic otel-secrets --namespace default \
#   --from-literal=SIGNOZ_API_KEY=...

kubectl config use-context gke_controlnet-407314_us-central1_gke-main-us-central1
helm upgrade otel-release-k8s-infra ./otel -f ./otel/values.yaml --namespace default

kubectl rollout restart deployment/otel-agent -n default
kubectl rollout restart deployment/otel-collector -n default
