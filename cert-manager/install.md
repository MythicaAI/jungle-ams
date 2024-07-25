# Install summary for cert-manager

See [installation](https://cert-manager.io/docs/installation/helm/)

### Add the repo
```bash
helm repo add jetstack https://charts.jetstack.io --force-update
```

### Install the chart
```bash
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.15.1 \
  --set crds.enabled=true \
  --set prometheus.enabled=false \  # Example: disabling prometheus using a Helm parameter
  --set webhook.timeoutSeconds=4   # Example: changing the webhook timeout using a Helm parameter
```

### Enable the gateway API

```bash
helm upgrade --install cert-manager jetstack/cert-manager --namespace cert-manager \
  --set "extraArgs={--enable-gateway-api}"
```
