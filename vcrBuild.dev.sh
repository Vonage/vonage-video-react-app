#!/bin/bash
set -e

# build artifact
source ./vcrBuild.sh

# write the env file to the build output (FAIL if missing): the env.defaults.sh values (loaded by
# vcrBuild.sh through env.sh) first, then backend/.env, whose values win
if [ -f ./backend/.env ]; then
  {
    for name in $(grep -oE '^export [A-Z_]+' ./env.defaults.sh | cut -d' ' -f2); do
      printf "%s='%s'\n" "$name" "${!name}"
    done
    cat ./backend/.env
  } > ./backend/dist/.env
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
