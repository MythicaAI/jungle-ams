aws eks update-kubeconfig --region us-east-1 --name mythica_aws
kubectl config use-context arn:aws:eks:us-east-1:050752617649:cluster/mythica_aws
kubectl get pods

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

