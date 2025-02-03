#!/bin/bash
kubectl config use-context arn:aws:eks:us-east-1:050752617649:cluster/mythica_aws

# Variables
export SA_NAME=tailscale
export TS_KUBE_SECRET=tailscale
export TS_AUTH_KEY="tskey-auth-kcRsQxvCor11CNTRL-tfUfBa6UbZKzdYUPNTmFZKuzwDgrEWRw"  # Replace with your actual Tailscale auth key
export TS_ROUTES="10.100.0.0/16"

kubectl delete pod router
kubectl delete deployment router-deployment

kubectl create secret generic $TS_KUBE_SECRET \
  --from-literal=TS_AUTHKEY=$TS_AUTH_KEY \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Applying RBAC rules..."
make rbac | kubectl apply -f-
# kubectl auth can-i patch secret/tailscale-auth --as=system:serviceaccount:default:tailscale -n default

echo "Deploying router..."
kubectl apply -f tailscale-router.yaml

kubectl get pods

