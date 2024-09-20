#!/bin/sh
sleep 30
echo "launching certbot webroot ${CHALLENGE_ROOT} domains ${DOMAINS}"
certbot certonly \
  --webroot \
  -w ${CHALLENGE_ROOT} \
  --domains ${DOMAINS} \
  --cert-name mythica-api-cert-group \
  --email jacob@mythica.ai \
  --agree-tos \
  -n \
  --debug-challenges \
  -vvv \
  --issuance-timeout 600 \
  --deploy-hook update-secrets.sh \
  ${EXTRA_ARGS}
