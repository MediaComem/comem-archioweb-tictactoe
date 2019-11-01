#!/bin/bash
set -e
cp /etc/letsencrypt/live/wamp/*.pem /etc/wamp/ssl/
chmod -R 644 /etc/wamp/ssl/*.pem