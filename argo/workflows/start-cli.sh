#!/usr/bin/env bash

# run ./test-token.sh to get a new token
source ~/.argo_token

ARGO_SERVER=localhost:2746
ARGO_NAMESPACE=argo

docker run --rm -it \
  -e ARGO_SERVER=$ARGO_SERVER \
  -e ARGO_TOKEN=$ARGO_TOKEN \
  -e ARGO_HTTP=false \
  -e ARGO_HTTP1=true \
  -e KUBECONFIG=/dev/null \
  -e ARGO_NAMESPACE=$ARGO_NAMESPACE  \
  argoproj/argocli:latest template list -v -e -k
