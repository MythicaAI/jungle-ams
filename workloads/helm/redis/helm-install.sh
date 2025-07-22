helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update
helm install --namespace container-registry redis bitnami/redis
