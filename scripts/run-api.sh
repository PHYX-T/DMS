#!/usr/bin/env bash
set -euo pipefail

echo "Loading HOST/PORT from .env (if present, without overriding existing env) and starting API..."

if [ -f .env ]; then
  while IFS='=' read -r key value; do
    # Skip comments/blank lines
    [ -z "$key" ] && continue
    case "$key" in \#*) continue;; esac
    # Trim whitespace
    key="$(echo "$key" | sed 's/^\s*//;s/\s*$//')"
    value="$(echo "$value" | sed 's/^\s*//;s/\s*$//')"
    # Only set if not already exported
    if [ -n "$key" ] && [ -z "${!key+x}" ]; then
      export "$key"="$value"
    fi
  done < .env
fi

HOST=${HOST:-127.0.0.1}
PORT=${PORT:-8000}

echo "Binding to http://$HOST:$PORT"
exec python3 -m src.api.server
