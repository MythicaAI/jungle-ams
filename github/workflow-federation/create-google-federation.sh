#!/usr/bin/sh bash

source vars.sh

# Validate the artifact registry exists (full name)
gcloud artifacts repositories describe ${AR_NAME} \
	--location=${LOCATION}

#
# Create service account to impersonate
#
gcloud iam service-accounts create github-actions-service-account  \
--description="A service account for use in a GitHub Actions workflow"  \
--display-name="GitHub Actions service account."

# Allow images to be created the first time they are pushed by SA
gcloud artifacts repositories add-iam-policy-binding ${AR_NAME} \
 --location=${LOCATION}  \
 --role=roles/artifactregistry.createOnPushWriter  \
 --member=serviceAccount:${SA_ACCOUNT}

 # Grant service account token creator to SA
gcloud iam service-accounts add-iam-policy-binding ${SA_ACCOUNT} \
 --role=roles/iam.serviceAccountTokenCreator \
 --member=user:jacob@mythica.ai

# Grant workload identity user to SA for federated principal
gcloud iam service-accounts add-iam-policy-binding ${SA_ACCOUNT} \
 --role=roles/iam.workloadIdentityUser  \
 --member=principalSet://iam.googleapis.com/${WIP_POOL}/attribute.repository/MythicaAI/infra

# Grant workload identity user to SA for K8S service account principal
gcloud iam service-accounts add-iam-policy-binding \                              1 ↵
  github-actions-service-account@controlnet-407314.iam.gserviceaccount.com \
  --role roles/iam.workloadIdentityUser \
  --member "serviceAccount:controlnet-407314.svc.id.goog[api-staging/github-actions-service-account]"

#
# Create the workload identity pool
#
gcloud iam workload-identity-pools create ${WIP_NAME} \
 --project=$PROJECT_ID  \
 --location=global  \
 --display-name="Mythica gh infra"

# Create the federated OIDC provider for the worload identity pool
gcloud iam workload-identity-pools providers create-oidc "${WIP_PROVIDER_NAME}"  \
 --project="${PROJECT_ID}"  \
 --location="global"  \
 --workload-identity-pool="${WIP_NAME}"  \
 --display-name="Mythica Infra GH Action Provider"  \
 --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner"  \
 --attribute-condition="assertion.repository_owner == '${GITHUB_ORG}'"  \
 --issuer-uri="https://token.actions.githubusercontent.com"

# Get the name of the provider
gcloud iam workload-identity-pools providers describe "${WIP_PROVIDER_NAME}"  \
 --project="${PROJECT_ID}" \
 --location="global"  \
 --workload-identity-pool="${WIP_NAME}"  \
 --format="value(name)"

# export WIP_POOL_ID=projects/296075347103/locations/global/workloadIdentityPools/gh-infra-pool

