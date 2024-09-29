#!/usr/bin/env bash
kubectl -n argo port-forward service/argo-server 2746 &

