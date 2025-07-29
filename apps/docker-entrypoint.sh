#!/bin/sh

# do the runtime variable substitutions

if [ ! -f jungle3/index.html.template ]; then
  echo "jungle3/index.html.template missing"
  exit 1
fi

envsubst < jungle3/index.html.template > jungle3/index.html

if [ ! -f jungle3/index.html ]; then
  echo "jungle3/index.html creation failed"
  exit 1
fi


if [ ! -f awful-ui/index.html.template ]; then
  echo "awful-ui/index.html.template missing"
  exit 1
fi

envsubst < awful-ui/index.html.template > awful-ui/index.html

if [ ! -f awful-ui/index.html ]; then
  echo "awful-ui/index.html creation failed"
  exit 1
fi



if [ -z "$PUBLISH_PATH" ]; then
  echo "PUBLISH_PATH must be defined in environment"
  exit 1
fi

echo "envsubst finished on $PWD/index.html"

cp -a awful-ui ${PUBLISH_PATH}/awful-ui
cp -a jungle3 ${PUBLISH_PATH}/jungle3
if [ $? -ne 0 ]; then
  "copy to ${PUBLISH_PATH} failed"
  exit 1
fi
