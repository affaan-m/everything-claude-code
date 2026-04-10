#!/bin/sh
set -e

# Ensure the uploads volume is owned by appuser before dropping privileges.
# Named Docker volumes are seeded from the image on first creation, but bind
# mounts and pre-existing volumes may be root-owned. gosu gives us a clean
# exec with proper signal forwarding (unlike `su -c`).
chown -R appuser:appuser /app/uploads

exec gosu appuser "$@"
