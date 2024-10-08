#!/usr/bin/env bash

# Variables for the staging environment
BUCKET_NAME=mythica-staging-web-content
KSA_NAME=staging-api
NAMESPACE=staging-api
ROLE_NAME=roles/storage.objectUser  # read/write
PROJECT_NUMBER=296075347103
PROJECT_ID=controlnet-407314
SERVICE_ACCOUNT_NAME=front-end-api-staging-sa
SERVICE_ACCOUNT=$SERVICE_ACCOUNT_NAME@controlnet-407314.iam.gserviceaccount.com

# Uncomment the following line if you want to add service-accounts
# Create a separate service account for staging
# gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
#     --display-name "Front End API Staging Service Account" \
#     --project $PROJECT_ID


# 
# Create the K8s service account for staging
#
kubectl create namespace $KSA_NAME
kubectl -n $NAMESPACE create serviceaccount $KSA_NAME

# Create the api Service Account
kubectl create serviceaccount api --namespace=api-staging


# kubectl create secret generic secrets \
#     --from-literal=SQL_URL='postgresql://<user>:<pass>@<host>:5432/upload_pipeline_staging' \
#     --namespace=api-staging --dry-run=client -o yaml | kubectl apply -f -


#
# Add IAM policy binding for the staging environment
#
gcloud storage buckets add-iam-policy-binding gs://$BUCKET_NAME \
    --member "principal://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$PROJECT_ID.svc.id.goog/subject/ns/$NAMESPACE/sa/$KSA_NAME" \
    --role "$ROLE_NAME"

#
# Workload identity impersonation for the staging service account
#
gcloud iam service-accounts add-iam-policy-binding \
       --role roles/iam.workloadIdentityUser \
       --member "serviceAccount:${PROJECT_ID}.svc.id.goog[staging-api/staging-api]" \
       ${SERVICE_ACCOUNT}

# Annotate the Kubernetes service account with the GCP service account for workload identity
kubectl annotate serviceaccount --namespace $NAMESPACE $KSA_NAME \
        iam.gke.io/gcp-service-account=${SERVICE_ACCOUNT}

# Uncomment the following line if you want to add object admin permissions to the service account for the bucket
# gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectAdmin gs://${BUCKET_NAME}/
