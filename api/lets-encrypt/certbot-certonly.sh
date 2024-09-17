#!/bin/sh

certbot certonly \
  --standalone \
  --domains ${DOMAINS} \
  --cert-name mythica-api-cert-group \
  --email jacob@mythica.ai \
  --agree-tos \
  -n \
  --deploy-hook update-secrets.sh \
  ${EXTRA_ARGS}
