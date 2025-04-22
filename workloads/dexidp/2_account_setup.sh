#!/usr/bin/env bash

#
# requires one password command line and integration configuration
# https://developer.1password.com/docs/cli/get-started/#install 
op signin

# A secret reference URI includes the name of the vault, item, section, and field where a secret is stored in your 1Password account:

# op://vault-name/item-name/[section-name/]field-name

# To reference a file attachment, use the file name in place of a field name:

# op://vault-name/item-name/[section-name/]file-name

# If any of the names include an unsupported character, you can refer to it using its ID instead.
# https://developer.1password.com/docs/cli/secrets-reference-syntax

# Create the secret with the loaded values
export GOOGLE_WS_CLIENT_ID=op://Employee/Google-Workspace-Mytica-OIDC/username
export GOOGLE_WS_CLIENT_SECRET=op://Employee/Google-Workspace-Mytica-OIDC/credential

export POSTGRES_HOST=10.115.112.3
export POSTGRES_PORT=5432
export POSTGRES_DB=dex
export POSTGRES_USER=dex
export POSTGRES_PASSWORD=op://Employee/Google-CloudSQL-DEX/password

#
# Create the YAML expanded config version
#
kubectl -n dex delete secret/config
op run --no-masking -- envsubst < config.yaml.template > config.yaml
kubectl -n dex create secret generic config --from-file=config.yaml

#
# Create the TLS cert secret
#
kubectl -n dex create secret tls tls --key key.pem --cert certificate.pem
