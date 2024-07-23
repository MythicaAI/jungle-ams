#!/bin/sh

# Variables
NAMESPACE="api"
SECRET_NAME="letsencrypt-tls"

# Extract certificate files from the Certbot environment variable
TLS_CERT=$(cat "$RENEWED_LINEAGE/fullchain.pem")
TLS_KEY=$(cat "$RENEWED_LINEAGE/privkey.pem")

# Log the renewed domains (optional)
echo "Renewed domains: $RENEWED_DOMAINS"

# Create Kubernetes secret with the renewed certificate
kubectl create secret tls $SECRET_NAME \
  --cert=<(echo "$TLS_CERT") \
  --key=<(echo "$TLS_KEY") \
  --namespace api \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret tls $SECRET_NAME \
  --cert=<(echo "$TLS_CERT") \
  --key=<(echo "$TLS_KEY") \
  --namespace ingress \
  --dry-run=client -o yaml | kubectl apply -f -
