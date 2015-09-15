#!/bin/bash

openssl genrsa -out certs/secrets.key.pem 2048
openssl rsa -in certs/secrets.key.pem -pubout -out certs/public.pub
