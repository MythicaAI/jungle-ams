#!/usr/bin/env bash

KSA_NAME=automation
NAMESPACE=automation
PROJECT_ID=controlnet-407314
SERVICE_ACCOUNT=automation-sa@controlnet-407314.iam.gserviceaccount.com


# 
# Create the K8s service account
#
kubectl -n $NAMESPACE create serviceaccount $KSA_NAME


#
# Workload impersonation
#
gcloud iam service-accounts add-iam-policy-binding \
       --role roles/iam.workloadIdentityUser \
       --member "serviceAccount:${PROJECT_ID}.svc.id.goog[${NAMESPACE}/${KSA_NAME}]" \
       ${SERVICE_ACCOUNT} \
       --project=${PROJECT_ID}

kubectl annotate serviceaccount --namespace $NAMESPACE $KSA_NAME \
        iam.gke.io/gcp-service-account=${SERVICE_ACCOUNT}

#gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectAdmin gs://${BUCKET_NAME}/

