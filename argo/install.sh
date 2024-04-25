#!/usr/bin/env bash

VERSION=v3.5.6

set -eof pipefail

create_namespace() {
  name=$1

  # Check if the resource already exists
  if kubectl get namespace "$name" >/dev/null 2>&1; then
    echo "Namespace $name already exists. Skipping creation."
  else
    # Create the resource
    if kubectl create namespace "$name"; then
      echo "Namespace $name created successfully."
    else
      echo "Failed to create namespace $name."
      exit 1
    fi
  fi
}

# installed on mac with brew install argo
#curl -sLO https://github.com/argoproj/argo-workflows/releases/download/$VERSION/argo-darwin-amd64.gz
#gunzip argo-darwin-amd64.gz
#chmod +x argo-darwin-amd64
#mv argo-darwin-amd64

# kubectl create namespace argo
create_namespace argo
kubectl apply -n argo -f https://github.com/argoproj/argo-workflows/releases/download/$VERSION/install.yaml
