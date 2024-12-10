#!/usr/bin/env bash

#
# requires one password command line and integration configuration
# https://developer.1password.com/docs/cli/get-started/#install 
op signin

# A secret reference URI includes the name of the vault, item, section, and field where a secret is stored in your 1Password account:

# op://vault-name/item-name/[section-name/]field-name

# To reference a file attachment, use the file name in place of a field name:

# op://vault-name/item-name/[section-name/]file-name

# If any of the names include an unsupported character, you can refer to it using its ID instead.
# https://developer.1password.com/docs/cli/secrets-reference-syntax

# Create the secret with the loaded values
SIGNOZ_API_KEY=$(op read op://Infrastructure/api-staging-secrets/signoz-api-key)
CLOUD_SQL_URL=$(op read op://Infrastructure/api-staging-secrets/sql-url)
CLOUD_SQL_ASYNC_URL=$(op read op://Infrastructure/api-staging-secrets/sql-async-url)
SERVICE_ACCOUNT_JSON=$(op read op://Infrastructure/front-end-api-staging-sa/service-account.json)
AUTH0_CLIENT_ID=$(op read op://Infrastructure/api-staging-secrets/auth0-client-id)
AUTH0_CLIENT_SECRET=$(op read op://Infrastructure/api-staging-secrets/auth0-client-secret)
AUTH0_DOMAIN=$(op read op://Infrastructure/api-staging-secrets/auth0-domain)
CANARY_API_KEY=$(op read op://Infrastructure/api-staging-secrets/canary-api-key)

kubectl delete secret/secrets -n api-staging
kubectl create secret generic secrets \
  --from-literal=SIGNOZ_API_KEY=$SIGNOZ_API_KEY \
  --from-literal=SQL_URL=$CLOUD_SQL_URL \
  --from-literal=SQL_ASYNC_URL=$CLOUD_SQL_ASYNC_URL \
  --from-literal=AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID \
  --from-literal=AUTH0_CLIENT_SECRET=$AUTH0_CLIENT_SECRET \
  --from-literal=AUTH0_DOMAIN=$AUTH0_DOMAIN \
  --namespace=api-staging

kubectl delete secret/canary-secrets -n api-staging
kubectl create secret generic canary-secrets \
  --from-literal=MYTHICA_API_KEY=$MYTHICA_API_KEY \
  --namespace=api-staging


kubectl delete secret/front-end-api-staging-sa -n api-staging
kubectl create secret generic front-end-api-staging-sa \
  --from-literal=service-account.json="$SERVICE_ACCOUNT_JSON" \
  --namespace=api-staging
