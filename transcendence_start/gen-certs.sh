#!/usr/bin/env bash
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/selfsigned.key -out certs/selfsigned.crt \
  -subj "/CN=localhost"
echo "Generated certs/selfsigned.key and certs/selfsigned.crt"
