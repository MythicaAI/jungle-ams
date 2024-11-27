#!/bin/sh

# do the runtime variable substitutions
if [ ! -f index.html.template ]; then
  echo "index.html.template missing"
  exit 1
fi

envsubst < index.html.template > index.html

if [ ! -f index.html ]; then
  echo "index.html creation failed"
  exit 1
fi

if [ -z "$PUBLISH_PATH" ]; then
  echo "PUBLISH_PATH must be defined in environment"
  exit 1
fi

echo "envsubst finished on $PWD/index.html"

cp -a /dist/jungle3 ${PUBLISH_PATH}
if [ $? -ne 0 ]; then
  "copy to ${PUBLISH_PATH} failed"
  exit 1
fi
