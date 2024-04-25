#!/usr/bin/env bash

VERSION=v3.5.6
PROJECT_ID=controlnet-407314
SERVER_SERVICE_ACCOUNT=argo-server-sa@controlnet-407314.iam.gserviceaccount.com
SERVICE_ACCOUNT=argo-sa@controlnet-407314.iam.gserviceaccount.com

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

# installed on mac with brew install argo
#curl -sLO https://github.com/argoproj/argo-workflows/releases/download/$VERSION/argo-darwin-amd64.gz
#gunzip argo-darwin-amd64.gz
#chmod +x argo-darwin-amd64
#mv argo-darwin-amd64
#
# from https://github.com/DevSecOpsSamples/gke-workload-identity?tab=readme-ov-file#step3-iam-service-account-for-bucket-api
#
# https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity
# https://cloud.google.com/sdk/gcloud/reference/iam/service-accounts/add-iam-policy-binding

# kubectl create namespace argo
create_namespace argo

# install the argo resources
#!/bin/bash

read -p "Install argo resources [y/N]? " choice
case "$choice" in
  y|Y)
    kubectl apply -n argo -f https://github.com/argoproj/argo-workflows/releases/download/$VERSION/install.yaml
    ;;
  n|N)
    ;;
  *)
    ;;
esac

# argo has a default service account of argo-server
# setup the IAM service account resource on the GCP side

#gcloud iam service-accounts create ${SERVICE_ACCOUNT} --display-name="bucket-api-ns service account"
#gcloud iam service-accounts list | grep bucket-api-sa

# allow workload impersonation
gcloud iam service-accounts add-iam-policy-binding \
       --role roles/iam.workloadIdentityUser \
       --member "serviceAccount:${PROJECT_ID}.svc.id.goog[argo/argo-server]" \
       ${SERVER_SERVICE_ACCOUNT}
gcloud iam service-accounts add-iam-policy-binding \
       --role roles/iam.workloadIdentityUser \
       --member "serviceAccount:${PROJECT_ID}.svc.id.goog[argo/argo]" \
       ${SERVICE_ACCOUNT}

# Add the workload annotations
kubectl annotate serviceaccount --namespace argo argo-server \
        iam.gke.io/gcp-service-account=${SERVER_SERVICE_ACCOUNT}
kubectl annotate serviceaccount --namespace argo argo \
        iam.gke.io/gcp-service-account=${SERVICE_ACCOUNT}


#
# Add role bindings to other cloud resources
#
#gcloud storage buckets create gs://${GCS_BUCKET_NAME}

#gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com:objectAdmin \
       #gs://${GCS_BUCKET_NAME}/
