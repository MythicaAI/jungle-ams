#!/usr/bin/env
set -x
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 3650 -nodes -subj "/C=US/ST=California/L=Orange/O=Mythica/OU=Engineering/CN=dex.mythica.ai"
