#!/usr/bin/env bash

source .vars

set -x
set -eof pipefail

create_namespace() {
  name=$1

  # Check if the resource already exists
  if kubectl get namespace "$name" >/dev/null 2>&1; then
    echo "Namespace $name already exists. Skipping creation."
  else
    # Create the resource
    if kubectl apply -f namespace.yaml; then
      echo "Namespace $name created successfully."
    else
      echo "Failed to create namespace $name."
      exit 1
    fi
  fi
}

# kubectl create namespace argo
create_namespace dex

# install the dex resources
read -p "Install dex resources [y/N]? " choice
case "$choice" in
  y|Y)
    #git clone git@github.com:argoproj/argo-workflows.git
    #cd argo-workflows
    #kubectl apply -n argo -f https://github.com/argoproj/argo-workflows/releases/download/$VERSION/install.yaml
    ;;
  n|N)
    ;;
  *)
    ;;
esac

# allow workload impersonation
gcloud iam service-accounts add-iam-policy-binding \
       --role roles/iam.workloadIdentityUser \
       --member "serviceAccount:${PROJECT_ID}.svc.id.goog[dex/dex]" \
       ${SERVER_SERVICE_ACCOUNT}

# Add the workload annotations
kubectl annotate serviceaccount --namespace dex dex \
        iam.gke.io/gcp-service-account=${SERVER_SERVICE_ACCOUNT}

