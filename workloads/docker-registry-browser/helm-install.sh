#!/usr/bin/env bash

helm repo add klausmeyer https://klausmeyer.github.io/helm-charts/
helm install registry-browser --namespace container-registry -f values.yaml klausmeyer/docker-registry-browser
