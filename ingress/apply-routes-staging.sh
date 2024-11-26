#!/usr/bin/env bash

kubectl -n api-staging delete httproute/api-staging
kubectl -n api-staging apply -f httproute-web-front-staging.yaml
