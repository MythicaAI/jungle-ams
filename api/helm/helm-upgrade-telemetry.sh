#!/usr/bin/env bash

# there should be secret 
# kubectl create secret generic otel-secrets --namespace default \
#   --from-literal=SIGNOZ_API_KEY=...

helm upgrade otel-release-k8s-infra ./otel -f ./otel/values.yaml --namespace default

kubectl rollout restart deployment/otel-agent -n default
kubectl rollout restart deployment/otel-collector -n default
