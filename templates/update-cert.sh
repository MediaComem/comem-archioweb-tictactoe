#!/bin/bash
set -e
cp /etc/letsencrypt/live/wamp/fullchain.pem /etc/letsencrypt/live/wamp/privkey.pem /etc/wamp/ssl/
chmod -R 644 /etc/wamp/ssl/*.pem