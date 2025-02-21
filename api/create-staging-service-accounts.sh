#!/usr/bin/env bash

# Variables for the staging environment
BUCKET_NAME=mythica-staging-web-content
KSA_NAME=api
NAMESPACE=api-staging
ROLE_NAME=roles/storage.objectUser  # read/write
PROJECT_NUMBER=296075347103
PROJECT_ID=controlnet-407314
SERVICE_ACCOUNT_NAME=front-end-api-staging-sa
SERVICE_ACCOUNT=$SERVICE_ACCOUNT_NAME@controlnet-407314.iam.gserviceaccount.com

# Uncomment the following line if you want to add service-accounts
# Create a separate service account for staging
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name "Front End API Staging Service Account" \
    --project $PROJECT_ID

cloud iam service-accounts create front-end-api-staging-sa \
    --display-name "Front End API Staging Service Account" \
    --project=controlnet-407314

# 
# Create the K8s service account for staging
#
kubectl create namespace $NAMESPACE

# Create the api Service Account
kubectl create serviceaccount $KSA_NAME --namespace=$NAMESPACE

# kubectl create secret generic secrets \
#     --from-literal=SQL_URL='postgresql+asyncpg://<user>:<pass>@<host>:5432/upload_pipeline_staging' \
#     --namespace=$NAMESPACE --dry-run=client -o yaml | kubectl apply -f -


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
       --member "serviceAccount:${PROJECT_ID}.svc.id.goog[$NAMESPACE/$KSA_NAME]" \
       ${SERVICE_ACCOUNT}


gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/container.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/storage.objectAdmin"

# Annotate the Kubernetes service account with the GCP service account for workload identity
kubectl annotate serviceaccount --namespace $NAMESPACE $KSA_NAME \
        iam.gke.io/gcp-service-account=${SERVICE_ACCOUNT}

NAMESPACE=api-staging
for sa in $(kubectl get serviceaccounts -n $NAMESPACE -o jsonpath='{.items[*].metadata.name}'); do
    if kubectl auth can-i list secrets --as=system:serviceaccount:$NAMESPACE:$sa; then
        echo "$sa has permission"
    else
        echo "$sa does NOT have permission"
    fi
done



# Uncomment the following line if you want to add object admin permissions to the service account for the bucket
# gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectAdmin gs://${BUCKET_NAME}/
# gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:roles/storage.objectAdmin gs://${BUCKET_NAME}

# gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:roles/storage.objectViewer gs://${BUCKET_NAME}/
