#!/bin/bash

# Namespace and environment name
NAMESPACE="api-staging"
RELEASE_NAME="api-staging"

kubectl config use-context gke_controlnet-407314_us-central1_gke-main-us-central1
# Fetch and display the Helm release history
echo "Fetching Helm history for '$RELEASE_NAME' in namespace '$NAMESPACE'..."
helm history $RELEASE_NAME --namespace $NAMESPACE

# Ask the user to input the revision number
echo ""
read -p "Enter the REVISION number to roll back to: " TARGET_REVISION

# Validate the revision number
if [[ -z "$TARGET_REVISION" ]]; then
  echo "No revision entered. Exiting."
  exit 1
fi

# Confirm rollback with the user
read -p "Are you sure you want to roll back to REVISION $TARGET_REVISION? (Y/n): " CONFIRMATION

# Set default to 'yes' if input is empty
CONFIRMATION=${CONFIRMATION:-Y}

if [[ "$CONFIRMATION" != "Y" && "$CONFIRMATION" != "y" ]]; then
  echo "Rollback canceled."
  exit 1
fi

# Perform the rollback
echo "Rolling back to revision $TARGET_REVISION..."
helm rollback $RELEASE_NAME $TARGET_REVISION --namespace $NAMESPACE

# Verify if rollback succeeded
if [ $? -eq 0 ]; then
  echo "Rollback to revision $TARGET_REVISION successful."
else
  echo "Failed to rollback to revision $TARGET_REVISION."
  exit 1
fi

kubectl rollout restart deployment/app -n api-staging
kubectl rollout restart deployment/packager -n api-staging
kubectl rollout restart deployment/web-front -n api-staging
