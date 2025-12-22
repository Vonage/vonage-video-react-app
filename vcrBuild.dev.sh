#!/bin/bash
set -e

# check for pending changes to commit
if [ -n "$(git status --porcelain)" ]; then
  echo "You have uncommitted changes. Please commit or stash them before running this script."
  exit 1
fi

# execute the original script
sh ./vcrBuild.sh

# restore repo state
git restore .
