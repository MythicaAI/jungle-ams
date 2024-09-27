#!/usr/bin/env bash

# Name of google project and primary location
export PROJECT_ID=controlnet-407314
export LOCATION=us-central1

# Name of organization on github
export GITHUB_ORG=MythicaAI

# Name of artifact registry
export AR_NAME=gke-us-central1-images 

# Service account to impersonate
export SA_NAME=github-actions-service-account
export SA_ACCOUNT=${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com

# Workload identity pool and pool provider name
export WIP_NAME="gh-infra-pool" 
export WIP_PROVIDER_NAME="github-mythica-infra"

