NAMESPACE=nats

set -x
set -eof pipefail

create_namespace() {
  name=$1

  # Check if the resource already exists
  if kubectl get namespace "$name" >/dev/null 2>&1; then
    echo "Namespace $name already exists. Skipping creation."
  else
    # Create the resource
    if kubectl create namespace "$name"; then
      echo "Namespace $name created successfully."
    else
      echo "Failed to create namespace $name."
      exit 1
    fi
  fi
}

create_namespace ${NAMESPACE}

kubectl config set-context --current --namespace=${NAMESPACE}

helm repo add nats https://nats-io.github.io/k8s/helm/charts/
helm install nats nats/nats

kubectl apply -f nats-lb.yaml
