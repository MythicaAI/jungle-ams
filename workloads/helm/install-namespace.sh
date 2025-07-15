#!/bin/bash

set -euo pipefail

upsert_namespace() {
  local namespace="${1}"
  
  if [[ -z "${namespace}" ]]; then
    echo "Error: Namespace name cannot be empty" >&2
    return 1
  fi
  
  kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: ${namespace}
EOF
}

main() {
  if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <namespace-name>" >&2
    exit 1
  fi
  
  upsert_namespace "$1"
}

main "$@"
