#!/usr/bin/env bash
#
set -eof pipefail

SITE_NAME=${1:-jungle}

COMMIT_HASH=$(git rev-parse --short=8 HEAD)
GCS_BUCKET=mythica-public-web-content
GCS_PATH=sites/${SITE_NAME}/versions/${COMMIT_HASH}/
POINTER_FILE=${SITE_NAME}.txt
GCS_POINTER_PATH=pointers_sites/latest/

CMD="gsutil -m cp -r ${SITE_NAME}/* gs://${GCS_BUCKET}/${GCS_PATH}"

# Copy files
echo "run publish command:"
echo $CMD
read -p "[y/N]? " choice
case "$choice" in
  y|Y)
    $CMD
    echo "updating ${POINTER_FILE} to $COMMIT_HASH"
    echo $COMMIT_HASH > $POINTER_FILE
    gsutil cp $POINTER_FILE gs://${GCS_BUCKET}/${GCS_POINTER_PATH}
    kubectl rollout restart deploy api
    ;;
  n|N)
    ;;
  *)
    ;;
esac

