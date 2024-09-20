#!/usr/bin/env bash
openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem
kubectl create secret tls dex-tls --key key.pem --certificate certificate.pem
