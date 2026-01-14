#!/bin/bash
set -e

# build artifact
source ./vcrBuild.sh

# copy env file to the build output (FAIL if missing)
if [ -f ./backend/.env ]; then
  cp ./backend/.env ./backend/dist/.env
else
  echo "❌ ERROR: ./backend/.env file not found"
  exit 1
fi

# copy the VCR Development manifest to the build output (FAIL if missing)
if [ -f ./vcr-dev.yml ]; then
  cp ./vcr-dev.yml ./backend/dist/vcr-dev.yml
else
  echo "❌ ERROR: ./vcr-dev.yml not found"
  exit 1
fi

echo ""
echo "Successfully added development files to backend/dist:"
