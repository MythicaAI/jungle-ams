#!/bin/sh

# Extract certificate files from the Certbot environment variable
TLS_CERT=$(cat "$RENEWED_LINEAGE/fullchain.pem")
TLS_KEY=$(cat "$RENEWED_LINEAGE/privkey.pem")

# Log the renewed domains (optional)
echo "Renewed domains: $RENEWED_DOMAINS"

kubectl create secret tls $TLS_NAME \
  --cert=<(echo "$TLS_CERT") \
  --key=<(echo "$TLS_KEY") \
  --namespace $TLS_NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -
