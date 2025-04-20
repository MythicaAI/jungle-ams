NAMESPACE=tailscale

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

gcloud container clusters update projects/controlnet-407314/zones/us-central1/clusters/gke-main-us-central1 --workload-policies=allow-net-admin

################
# NOTES:
# 
# - create/update an auth_key using update_auth_key.sh. Keys have a 90 
#   day expiry so this needs to be done from time to time
# - apply the yamls
# - manual configuration is required once completed.Go to tailscale admin:
#      - find the subnet-router endpoint and enable the routes it advertises
#      - Go to DNS and add .svc.cluster.local as a search domain and add
#        the cube-DNS servers IP as a split DNS server for the svc.cluster.local
#        domain (use `kubectl get -n kube-system svc/kube-dns` to get cubeDNS IP)