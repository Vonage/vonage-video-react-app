#!/bin/bash

# commited files not yet in main
newFiles=$(git diff --diff-filter=A --name-only main HEAD | grep -E '\.(ts)$')

invalidFiles=$(for file in $newFiles; do basename "$file"; done | grep -vE '^[a-z]+([0-9]|[A-Z0-9][a-z0-9]+)*[A-Z]?(\..*)?$')

if [[ -n $invalidFiles ]]; then
  echo "Filenames must be camelCase:"
  echo "$invalidFiles"
  exit 1
fi
