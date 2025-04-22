#!/usr/bin/env bash
aws ecr get-login-password --region us-east-1 --profile mythica-admin | docker login --username AWS --password-stdin 050752617649.dkr.ecr.us-east-1.amazonaws.com
