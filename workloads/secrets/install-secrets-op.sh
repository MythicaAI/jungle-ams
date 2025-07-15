#!/usr/bin/env bash

#
# requires one password command line and integration configuration
# https://developer.1password.com/docs/cli/get-started/#install 

# A secret reference URI includes the name of the vault, item, section, and field where a secret is stored in your 1Password account:

# op://vault-name/item-name/[section-name/]field-name

# To reference a file attachment, use the file name in place of a field name:

# op://vault-name/item-name/[section-name/]file-name

# If any of the names include an unsupported character, you can refer to it using its ID instead.
# https://developer.1password.com/docs/cli/secrets-reference-syntax

export NAMESPACE=${1:-api-staging}
export OP_GROUP=${2:-Infrastructure}
export OP_SECRET=${2:-$NAMESPACE-secrets}

function usage_exit() {
  echo "usage: ./install-secrets.sh <namespace> [op-group] [op-category]"
  exit 1
}

if [ -z "$NAMESPACE" ]; then
  usage_exit
fi

if [ -z "$OP_GROUP" ]; then
  usage_exit
fi

if [ -z "$OP_SECRET" ]; then
  usage_exit
fi

echo "Installing secrets from $OP_GROUP/$OP_SECRET to namespace $NAMESPACE..."

envsubst < install.env.template > install.env

echo "Running kubectl commands with 1Password secrets..."

op run --env-file install.env -- bash ./kubectl-commands.sh

echo "Done."
