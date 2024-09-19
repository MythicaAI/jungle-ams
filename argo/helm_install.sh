helm repo add argo https://argoproj.github.io/argo-helm
helm install argo argo/argo-workflows --namespace argo -f values.yaml
