#!/bin/bash
# This script is used to install dependencies and build the app in the machine used by VCR 
# rather than uploading the build built locally
# https://developer.vonage.com/en/vonage-cloud-runtime/guides/manifest#build-script

# run install skipping post install script which requires husky
yarn install --production=false --ignore-scripts --frozen-lockfile
yarn build

# keep only necessary files for VCR deployment and git files to avoid messing up the repo state locally
find . -mindepth 1 \
  ! -path "./backend" \
  ! -path "./backend/dist" \
  ! -path "./backend/dist/*" \
  ! -path "./backend/bundle.cjs" \
  ! -path "./.git*" \
  ! -path "./.github*" \
  ! -name ".gitignore" \
  ! -name ".gitattributes" \
  ! -name ".gitmodules" \
  ! -name "*.sh" \
  ! -name "*.yml" \
  ! -name ".env" \
  ! -name ".env.*" \
  ! -path "*/config.json" \
  ! -path "*/config.*.json" \
  ! -path "./.vscode*" \
  -exec rm -rf {} + 2>/dev/null

echo ""
echo "=== backend  root contents ==="
find backend -maxdepth 1 -print  

echo ""
echo "=== backend/dist contents ==="
find backend/dist -print

