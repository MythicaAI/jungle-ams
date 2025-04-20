#!/bin/bash

# Prompt for the auth key
read -p "Enter the Tailscale AUTH_KEY: " AUTH_KEY

# Generate the YAML and apply it to Kubernetes
cat <<EOF | kubectl apply -f-
apiVersion: v1
kind: Secret
metadata:
  name: tailscale-auth
  namespace: tailscale
stringData:
  TS_AUTHKEY: ${AUTH_KEY}
EOF

