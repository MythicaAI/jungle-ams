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
export OP_GOOGLE_WS_CLIENT_ID=op://Employee/Google-Workspace-Mytica-OIDC/username
export OP_GOOGLE_WS_CLIENT_SECRET=op://Employee/Google-Workspace-Mytica-OIDC/credential

#
# Create the key, value secret version
#
kubectl -n dex delete secret/google-workspace-client

op run -- kubectl -n dex create secret \
    generic google-workspace-client \
    --from-literal=client-id=$OP_GOOGLE_WS_CLIENT_ID \
    --from-literal=client-secret=$OP_GOOGLE_WS_CLIENT_SECRET

#
# Create the YAML expanded config version
#
kubectl -n dex delete secret/connectors
op run --no-masking -- envsubst < connectors.yaml.template > connectors.yaml
kubectl -n dex create secret generic connectors --from-file=connectors.yaml
