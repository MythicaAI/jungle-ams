#!/usr/bin/env bash
#
# See: https://argo-workflows.readthedocs.io/en/release-3.5/access-token/#token-creation
#

NAME=mythica-dev
NAMESPACE=argo
VERBS=list,update,create,delete

#
# create a developer account to allow token access to the argo frontend
#
kubectl -n $NAMESPACE delete role $NAME
kubectl -n $NAMESPACE create role $NAME --verb=$VERBS --resource=workflows.argoproj.io

kubectl -n $NAMESPACE create sa $NAME
kubectl -n $NAMESPACE create rolebinding $NAME --role=$NAME --serviceaccount=argo:$NAME

kubectl apply -f - <<EOF
apiVersion: v1
kind: Secret
metadata:
  name: $NAME.service-account-token
  namespace: $NAMESPACE
  annotations:
    kubernetes.io/service-account.name: $NAME
type: kubernetes.io/service-account-token
EOF

echo Resources created, wait a few seconds and try the test script

