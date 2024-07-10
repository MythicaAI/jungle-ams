#!/usr/bin/env bash
#
set -eof pipefail

SITE_NAME=${1:-jungle}

COMMIT_HASH=$(git rev-parse --short=8 HEAD)
GCS_BUCKET=mythica-public-web-content
GCS_PATH=sites/${SITE_NAME}/versions/${COMMIT_HASH}/
POINTER_FILE=${SITE_NAME}.txt
GCS_POINTER_PATH=pointers_sites/latest/

#
# If the site is based on vite, build it first
#
if [[ -f ${SITE_NAME}/vite.config.ts ]]; then
  LOCAL_PATH="${SITE_NAME}/dist"
else
  LOCAL_PATH="${SITE_NAME}"
fi

if [[ ! -d ${LOCAL_PATH} ]]; then
  echo "site must exist, react sites must be built, see build.sh"
  exit 1
fi


CMD="gsutil -m cp -r ${LOCAL_PATH}/* gs://${GCS_BUCKET}/${GCS_PATH}"

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
    kubectl -n api rollout restart deploy web-front
    ;;
  n|N)
    ;;
  *)
    ;;
esac

