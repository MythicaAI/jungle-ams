#!/usr/bin/env bash
gcloud compute addresses create mythica-gke-gateway-address \
    --purpose=SHARED_LOADBALANCER_VIP \
    --region=us-central1 \
    --subnet=default \
    --addresses=10.128.1.1 \
    --project=controlnet-407314
