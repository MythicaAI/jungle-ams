kubectl config set-context --current --namespace=argo

helm install argo-events argo/argo-events

kubectl apply -f event-bus.yaml
kubectl apply -f event-roles.yaml
kubectl apply -f event-sources.yaml
kubectl apply -f event-sensors.yaml
