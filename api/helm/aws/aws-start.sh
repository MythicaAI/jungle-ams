aws eks update-kubeconfig --region us-east-1 --name aws_mythica
kubectl config use-context arn:aws:eks:us-east-1:050752617649:cluster/aws_mythica

# Steps to grant EKS to Artifact Registry
gcloud iam service-accounts create aws-account
gcloud projects add-iam-policy-binding controlnet-407314 \
  --member serviceAccount:aws-account@controlnet-407314.iam.gserviceaccount.com \
  --role roles/artifactregistry.reader

gcloud iam service-accounts keys create registry-access-key.json \
  --iam-account aws-account@controlnet-407314.iam.gserviceaccount.com

kubectl create secret docker-registry registry-secret \
  --docker-server=us-central1-docker.pkg.dev \
  --docker-username=_json_key \
  --docker-email=aws-account@controlnet-407314.iam.gserviceaccount.com \
  --docker-password="$(cat registry-access-key.json)"

# rm registry-access-key.json


# TESTING

## ROUTER

kubectl config use-context arn:aws:eks:us-east-1:050752617649:cluster/aws_mythica

kubectl create namespace tailscale
kubectl label namespace tailscale pod-security.kubernetes.io/enforce=privileged --overwrite
kubectl annotate namespace tailscale argocd.argoproj.io/sync-options="Prune=false" --overwrite
./update_auth_key.sh
kubectl apply -f router-sa.yaml
kubectl apply -f tailscale-router.yaml
kubectl get pods  -n tailscale
kubectl rollout restart deployment tailscale-router -n tailscale
kubectl logs -n tailscale deployment/tailscale-router

kubectl apply -f expose-router.yaml
kubectl apply -f coredns.yaml
kubectl rollout restart deployment coredns -n kube-system
kubectl logs -n kube-system -l k8s-app=kube-dns




kubectl run debug2 --image=nicolaka/netshoot -n tailscale --rm -it --restart=Never
ping 100.67.180.26

kubectl exec -it tailscale-router-d58458ccf-b84jf -n tailscale -- /bin/sh
ping 100.67.180.26


kubectl run -it --rm dns-test --image=alpine:3.18 --restart=Never \
  --overrides='{"spec":{"dnsConfig":{"nameservers":["10.100.193.229"]}}}' \
  -- sh



## " OPERATOR and EGRESS"

helm repo add tailscale https://pkgs.tailscale.com/helmcharts
helm repo update

helm upgrade \
  --install \
  tailscale-operator \
  tailscale/tailscale-operator \
  --namespace=tailscale \
  --create-namespace \
  --set-string oauth.clientId=...... \
  --set-string oauth.clientSecret=tskey-..... \
  --set-string apiServerProxyConfig.mode="noauth" \
  --wait   --reuse-values

kubectl get pods  -n tailscale

kubectl rollout restart deployment operator -n tailscale
kubectl rollout restart deployment nameserver -n tailscale

kubectl apply -f sa.yaml
kubectl apply -f dns.yaml
kubectl apply -f egress-sevice.yaml
kubectl apply -f coredns-backup.yaml

kubectl rollout restart deployment coredns -n kube-system
kubectl rollout restart deployment operator -n tailscale
kubectl get pods  -n tailscale

kubectl logs -n tailscale deployment/tailscale-router


kubectl rollout restart deployment ts-gke-tailscale-hx64k -n tailscale

kubectl rollout restart deployment coredns -n kube-system

kubectl get pods  -n tailscale




# ### Can help

# kubectl apply -f ./manifests.yaml 
# kubectl rollout restart deployment operator -n tailscale
# kubectl get pods  -n tailscale

# kubectl label namespace tailscale pod-security.kubernetes.io/enforce=privileged --overwrite
# kubectl annotate namespace tailscale argocd.argoproj.io/sync-options="Prune=false" --overwrite
# kubectl describe namespace tailscale
# kubectl rollout restart deployment operator -n tailscale
# kubectl rollout restart deployment nameserver -n tailscale

# kubectl apply -f sa.yaml
# kubectl apply -f dns.yaml
# kubectl apply -f egress-sevice.yaml
# kubectl apply -f coredns-backup.yaml
# kubectl get configmap coredns -n kube-system -o yaml

# kubectl rollout restart deployment coredns -n kube-system
# kubectl rollout restart deployment operator -n tailscale






# TL/DR

# CLEAN ALL

helm uninstall tailscale-operator --namespace=tailscale

kubectl patch proxyclass accept-routes --type=json -p='[{"op": "remove", "path": "/metadata/finalizers"}]'

kubectl rollout restart deployment/nameserver -n tailscale
kubectl rollout restart deployment/operator -n tailscale
kubectl get pods  -n tailscale

kubectl apply -f egress-sevice.yaml
kubectl get pods  -n tailscale

helm uninstall tailscale-operator --namespace tailscale
kubectl delete all --all -n tailscale 
kubectl get all -n tailscale
kubectl delete secret --all -n tailscale
kubectl delete secret ts-gke-tailscale-hx64k-0 -n tailscale
kubectl delete namespace tailscale

kubectl label crd dnsconfigs.tailscale.com app.kubernetes.io/managed-by=Helm
kubectl annotate crd dnsconfigs.tailscale.com meta.helm.sh/release-name=tailscale-operator
kubectl annotate crd dnsconfigs.tailscale.com meta.helm.sh/release-namespace=tailscale
kubectl delete crd dnsconfigs.tailscale.com

kubectl label crd proxyclasses.tailscale.com app.kubernetes.io/managed-by=Helm
kubectl annotate crd proxyclasses.tailscale.com meta.helm.sh/release-name=tailscale-operator
kubectl annotate crd proxyclasses.tailscale.com meta.helm.sh/release-namespace=tailscale
kubectl delete crd proxyclasses.tailscale.com

kubectl label crd recorders.tailscale.com app.kubernetes.io/managed-by=Helm
kubectl annotate crd recorders.tailscale.com meta.helm.sh/release-name=tailscale-operator
kubectl annotate crd recorders.tailscale.com meta.helm.sh/release-namespace=tailscale
kubectl delete crd recorders.tailscale.com

kubectl label crd proxygroups.tailscale.com app.kubernetes.io/managed-by=Helm
kubectl annotate crd proxygroups.tailscale.com meta.helm.sh/release-name=tailscale-operator
kubectl annotate crd proxygroups.tailscale.com meta.helm.sh/release-namespace=tailscale
kubectl delete crd proxygroups.tailscale.com


kubectl patch dnsconfigs.tailscale.com ts-dns --type=json -p='[{"op": "remove", "path": "/metadata/finalizers"}]'
kubectl label dnsconfigs.tailscale.com ts-dns app.kubernetes.io/managed-by=Helm
kubectl annotate dnsconfigs.tailscale.com ts-dns meta.helm.sh/release-name=tailscale-operator
kubectl annotate dnsconfigs.tailscale.com ts-dns meta.helm.sh/release-namespace=tailscale

kubectl patch proxyclass accept-routes --type=json -p='[{"op": "remove", "path": "/metadata/finalizers"}]'
kubectl label proxyclasses.tailscale.com accept-routes app.kubernetes.io/managed-by=Helm
kubectl annotate proxyclasses.tailscale.com accept-routes meta.helm.sh/release-name=tailscale-operator
kubectl annotate proxyclasses.tailscale.com accept-routes meta.helm.sh/release-namespace=tailscale

kubectl label crd connectors.tailscale.com app.kubernetes.io/managed-by=Helm
kubectl annotate crd connectors.tailscale.com meta.helm.sh/release-name=tailscale-operator
kubectl annotate crd connectors.tailscale.com meta.helm.sh/release-namespace=tailscale
kubectl delete crd connectors.tailscale.com

kubectl label clusterrole tailscale-operator app.kubernetes.io/managed-by=Helm
kubectl annotate clusterrole tailscale-operator meta.helm.sh/release-name=tailscale-operator
kubectl annotate clusterrole tailscale-operator meta.helm.sh/release-namespace=tailscale
kubectl delete clusterrole tailscale-operator

kubectl label clusterrolebinding tailscale-operator app.kubernetes.io/managed-by=Helm
kubectl annotate clusterrolebinding tailscale-operator meta.helm.sh/release-name=tailscale-operator
kubectl annotate clusterrolebinding tailscale-operator meta.helm.sh/release-namespace=tailscale
kubectl delete clusterrolebinding tailscale-operator

kubectl label ingressclass tailscale app.kubernetes.io/managed-by=Helm
kubectl annotate ingressclass tailscale meta.helm.sh/release-name=tailscale-operator
kubectl annotate ingressclass tailscale meta.helm.sh/release-namespace=tailscale
kubectl delete ingressclass tailscale

kubectl label secret operator-oauth app.kubernetes.io/managed-by=Helm -n tailscale
kubectl annotate secret operator-oauth meta.helm.sh/release-name=tailscale-operator -n tailscale
kubectl annotate secret operator-oauth meta.helm.sh/release-namespace=tailscale -n tailscale
kubectl delete secret operator-oauth -n tailscale


kubectl patch service gke-tailscale -n default --type=json -p='[{"op": "remove", "path": "/metadata/finalizers"}]'
kubectl delete service gke-tailscale -n default --force --grace-period=0

kubectl delete dnsconfigs.tailscale.com --all
kubectl delete proxyclasses.tailscale.com --all
kubectl delete dnsconfig.tailscale.com --all




