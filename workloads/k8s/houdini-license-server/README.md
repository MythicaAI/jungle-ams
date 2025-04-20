# houdini-license-server

## deploying

``` shell
kubectl apply -f namespace.yaml
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml
```

## accessing

``` shell
kubectl --namespace houdini port-forward svc/houdini-license-server 1715:1715 &
```

Then open up <http://localhost:1715> to see the license server web UI.
