#!/usr/bin/env bash

kubectl delete secret/secrets -n $NAMESPACE
kubectl create secret generic secrets \
  --from-literal=SIGNOZ_API_KEY=$SIGNOZ_API_KEY \
  --from-literal=SQL_URL=$CLOUD_SQL_URL \
  --from-literal=SQL_ASYNC_URL=$CLOUD_SQL_ASYNC_URL \
  --from-literal=AUTH0_CLIENT_ID=$AUTH0_CLIENT_ID \
  --from-literal=AUTH0_CLIENT_SECRET=$AUTH0_CLIENT_SECRET \
  --from-literal=AUTH0_DOMAIN=$AUTH0_DOMAIN \
  --from-literal=SENDGRID_API_KEY=$SENDGRID_API_KEY \
  --from-literal=DISCORD_INFRA_ALERTS_WEBHOOK=$DISCORD_INFRA_ALERTS_WEBHOOK \
  --namespace=api-staging

kubectl delete secret/canary-secrets -n $NAMESPACE
kubectl create secret generic canary-secrets \
  --from-literal=MYTHICA_API_KEY=$CANARY_API_KEY \
  --namespace=$NAMESPACE

kubectl delete secret/packager-secrets -n $NAMESPACE
kubectl create secret generic packager-secrets \
  --from-literal=MYTHICA_API_KEY=$PACKAGER_API_KEY \
  --namespace=$NAMESPACE

