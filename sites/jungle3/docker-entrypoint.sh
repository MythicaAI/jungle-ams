#!/bin/sh

# do the runtime variable substitutions
cat index.html.template
envsubst < index.html.template > index.html
cat index.html
echo "envsubst finished on $PWD/index.html"
exec "$@"
