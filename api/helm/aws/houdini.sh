
# Create namespace
kubectl config use-context arn:aws:eks:us-east-1:050752617649:cluster/mythica_aws
kubectl apply -f ./namespace.yaml
kubectl apply -f ./deployment_houdini_aws.yaml
