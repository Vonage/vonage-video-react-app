#!/bin/bash
set -e

# build artifact
source ./vcrBuild.env.sh

# run install skipping post install script which requires husky
yarn install --production=false --ignore-scripts --frozen-lockfile
yarn build

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
