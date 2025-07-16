Helm for API resources
===

This helm repo was built to allow the deployment of AMS and related resources to a Kubernetes cluster. The first MVP cluster was on GKE, the second cluster was AKS. A new cluster is being built on Hetzner.

## Generate the image tags for an API deployment:

```bash
api/helm-gen-values-images.sh
```

## Testing the template expansion:

```bash
helm template --namespace api-staging -f api/values-staging.yaml -f api/values-images.yaml --show-only templates/deployment-app.yaml --debug ./api
```