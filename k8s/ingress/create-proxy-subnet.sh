#!/usr/bin/env bash
#
gcloud compute networks subnets create regional-lb-proxy-subnet \
	--purpose=REGIONAL_MANAGED_PROXY \
	--role=ACTIVE \
	--region=us-central1 \
	--network=default \
	--range=10.120.0.0/23 && \
gcloud compute networks subnets describe regional-lb-proxy-subnet \
	--regions=us-central1
