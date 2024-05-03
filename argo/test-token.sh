#!/usr/bin/env bash
#
ARGO_SERVER=localhost:2746
NAME=mythica-dev

ARGO_TOKEN="$(kubectl get secret $NAME.service-account-token -o=jsonpath='{.data.token}' | base64 --decode)"

echo "ARGO_TOKEN=\"$ARGO_TOKEN\"" > ~/.argo_token
source ~/.argo_token

echo "Sending auth bearer request to API endpoint"
curl -s -k https://${ARGO_SERVER}/api/v1/workflows/argo -H "Authorization: Bearer $ARGO_TOKEN" 2>&1 | jq
