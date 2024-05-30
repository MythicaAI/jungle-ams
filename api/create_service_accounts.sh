#!/usr/bin/env bash

BUCKET_NAME=mythica-public-web-content
KSA_NAME=api
NAMESPACE=api
ROLE_NAME=roles/storage.objectUser # read/write
PROJECT_NUMBER=296075347103
PROJECT_ID=controlnet-407314
SERVICE_ACCOUNT=front-end-api-sa@controlnet-407314.iam.gserviceaccount.com


# 
# Create the K8s service account
#
kubectl -n $NAMESPACE create serviceaccount $KSA_NAME

#
# Add IAM policy binding, not sure if I like this way of doing it.
# suggested by googles docs
#
gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
    --member "principal://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$PROJECT_ID.svc.id.goog/subject/ns/$NAMESPACE/sa/$KSA_NAME" \
    --role "$ROLE_NAME"

#
# Workload impersonation
#
gcloud iam service-accounts add-iam-policy-binding \
       --role roles/iam.workloadIdentityUser \
       --member "serviceAccount:${PROJECT_ID}.svc.id.goog[api/api]" \
       ${SERVICE_ACCOUNT}

kubectl annotate serviceaccount --namespace $NAMESPACE $KSA_NAME \
        iam.gke.io/gcp-service-account=${SERVICE_ACCOUNT}

#gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectAdmin gs://${BUCKET_NAME}/

