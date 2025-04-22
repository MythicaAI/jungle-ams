#!/usr/bin/env bash

VERSION=v3.5.10
PROJECT_ID=controlnet-407314
SERVER_SERVICE_ACCOUNT=argo-server
SERVICE_ACCOUNT=argo
IAM_SUFFIX=sa
SERVICE_AT=controlnet-407314.iam.gserviceaccount.com
SERVER_SERVICE_ACCOUNT_FQ=${SERVER_SERVICE_ACCOUNT}-${IAM_SUFFIX}@${SERVICE_AT}
SERVICE_ACCOUNT_FQ=${SERVICE_ACCOUNT}-${IAM_SUFFIX}@${SERVICE_AT}
NAMESPACE=argo

set -x
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

create_namespace ${NAMESPACE}

gcloud iam service-accounts create ${SERVER_SERVICE_ACCOUNT}-${IAM_SUFFIX}
gcloud iam service-accounts create ${SERVICE_ACCOUNT}-${IAM_SUFFIX}

kubectl -n ${NAMESPACE} create serviceaccount ${SERVER_SERVICE_ACCOUNT}
kubectl -n ${NAMESPACE} create serviceaccount ${SERVICE_ACCOUNT}

# allow workload impersonation
gcloud iam service-accounts add-iam-policy-binding \
       --role roles/iam.workloadIdentityUser \
       --member "serviceAccount:${PROJECT_ID}.svc.id.goog[argo/argo-server]" \
       ${SERVER_SERVICE_ACCOUNT}-${IAM_SUFFIX}@${SERVICE_AT}
gcloud iam service-accounts add-iam-policy-binding \
       --role roles/iam.workloadIdentityUser \
       --member "serviceAccount:${PROJECT_ID}.svc.id.goog[argo/argo]" \
       ${SERVICE_ACCOUNT}-${IAM_SUFFIX}@${SERVICE_AT}

# Add the workload annotations
kubectl annotate serviceaccount --namespace argo argo-server \
        iam.gke.io/gcp-service-account=${SERVER_SERVICE_ACCOUNT}
kubectl annotate serviceaccount --namespace argo argo \
        iam.gke.io/gcp-service-account=${SERVICE_ACCOUNT}

