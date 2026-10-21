#!/bin/bash
set -e

# build artifact
source ./env.sh

# Remove once VIDSOL-1350 (#851) is merged into main. Comment-triggered deploys run the workflow
# from the default branch, which still sets up yarn, so pnpm has to be provisioned here.
PNPM_VERSION=12.11.2
if [ "$(pnpm --version 2> /dev/null)" != "$PNPM_VERSION" ]; then
  npm install --global "pnpm@$PNPM_VERSION"
fi

# run install skipping post install script which requires husky
pnpm install --prod=false --ignore-scripts --frozen-lockfile
pnpm build

# copy VCR manifest to the build output (FAIL if missing)
if [ -f ./vcr-gha.yml ]; then
  cp ./vcr-gha.yml ./backend/dist/vcr-gha.yml
else
  echo "❌ ERROR: ./vcr-gha.yml not found"
  exit 1
fi

echo ""
echo "Successfully prepared backend/dist:"
find backend/dist -print
