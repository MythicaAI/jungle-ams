#!/usr/bin/env bash

# delete existing secret
kubectl -n dex delete secret/config

# create new config from file
kubectl create secret generic config --from-file=config.yaml

# restart deployment
kubectl rollout restart deploy/dex

sleep 3

# show logs
kubectl logs -l app=dex
