#!/bin/bash
# This script is used to install dependencies and build the app in the machine used by VCR
# rather than uploading the build built locally
# https://developer.vonage.com/en/vonage-cloud-runtime/guides/manifest#build-script

set -e  # Exit on error

# Helper function to safely remove a path with logging
safe_remove() {
  local path="$1"
  if [ -e "$path" ]; then
    echo "  ✓ Removing: $path"
    rm -rf "$path"
  else
    echo "  ⊘ Not found (skipping): $path"
  fi
}

echo "=== Setting environment variables ==="
export VITE_ENABLE_REPORT_ISSUE=true
export VITE_I18N_FALLBACK_LANGUAGE='en'
export VITE_I18N_SUPPORTED_LANGUAGES='en|en-US|es|es-MX|it'

echo "=== Installing all dependencies (needed for build) ==="
# Install all dependencies including devDependencies (required for vite build)
yarn install --ignore-scripts --frozen-lockfile

echo "=== Building frontend ==="
yarn build

echo "=== Cleaning up to reduce image size ==="

echo "-- Removing node_modules --"
safe_remove node_modules
safe_remove frontend/node_modules
safe_remove integration-tests/node_modules

echo "-- Removing frontend source files (only dist is needed) --"
safe_remove frontend/src
safe_remove frontend/public
safe_remove frontend/vite.config.ts
safe_remove frontend/tailwind.config.js
safe_remove frontend/postcss.config.js
safe_remove frontend/tsconfig.json
safe_remove frontend/tsconfig.node.json
safe_remove frontend/index.html

echo "-- Removing integration tests --"
safe_remove integration-tests

echo "-- Removing docs --"
safe_remove docs
safe_remove generated-docs

echo "-- Removing unnecessary root files --"
safe_remove scripts
safe_remove .husky
safe_remove .github
safe_remove .eslintrc
safe_remove .prettierrc
safe_remove .editorconfig

echo "=== Installing production dependencies only ==="
# Reinstall only production dependencies for backend
cd backend
yarn install --production --ignore-scripts --frozen-lockfile
cd ..

echo "=== Build complete ==="
# Show final size
du -sh . 2>/dev/null || true