#!/bin/bash

# Prompt for the auth key
read -p "Enter the Tailscale TS_AUTHKEY: " TS_AUTHKEY
# TS_AUTHKEY: ${TS_AUTHKEY}

kubectl config use-context arn:aws:eks:us-east-1:050752617649:cluster/aws_mythica

# Generate the YAML and apply it to Kubernetes
cat <<EOF | kubectl apply -f-
apiVersion: v1
kind: Secret
metadata:
  name: tailscale-auth
  namespace: tailscale
stringData:
  TS_AUTHKEY: ${TS_AUTHKEY}
EOF


