#!/bin/bash
# Prints the first bare hostname in the DOMAIN secret, which is written as VCR's domains value.
set -euo pipefail

app_host="$(printf '%s' "${DOMAIN:-}" | sed -E 's/[][" ]//g; s/,.*//')"

if ! [[ "$app_host" =~ ^[A-Za-z0-9.-]+$ ]]; then
  echo "::error::The DOMAIN secret doesn't start with a hostname, so the OIDC redirect URIs would be invalid." >&2
  exit 1
fi

printf '%s\n' "$app_host"
