#!/usr/bin/env bash
#
# See: https://argo-workflows.readthedocs.io/en/release-3.5/access-token/#token-creation
#

NAME=mythica-dev
NAMESPACE=argo

#
# create a developer account to allow token access to the argo frontend
#
kubectl -n $NAMESPACE delete secret $NAME.service-account-token
kubectl -n $NAMESPACE delete rolebinding $NAME
kubectl -n $NAMESPACE delete role $NAME
kubectl -n $NAMESPACE delete sa $NAME

kubectl -n $NAMESPACE create sa $NAME

kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: $NAME
  namespace: $NAMESPACE
rules:
- apiGroups:
  - argoproj.io
  resources:
  - workflowtemplates
  - cronworkflows
  - clusterworkflowtemplates
  - workflows
  verbs:
  - list
  - update
  - create
  - delete
  - watch
  - get
  - patch
EOF

kubectl apply -f - <<EOF
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: mythica-dev-binding
  namespace: $NAMESPACE
subjects: 
- kind: ServiceAccount
  name: mythica-dev                 
  namespace: argo            
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: Role
  name: $NAME
EOF

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

