#!/bin/sh
sleep 600
while true; do
  echo "launching certbot renew webroot ${CHALLENGE_ROOT} domains ${DOMAINS}"
  certbot renew \
    --webroot \
    -w ${CHALLENGE_ROOT} \
    --domains ${DOMAINS} \
    -vvv \
    --quiet \
    --email jacob@mythica.ai \
    --agree-tos \
    --deploy-hook "update-secrets.sh";
  sleep 43200; # 12 hours
done