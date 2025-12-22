#!/bin/bash
# This script is used to install dependencies and build the app in the machine used by VCR
# rather than uploading the build built locally
# https://developer.vonage.com/en/vonage-cloud-runtime/guides/manifest#build-script
# run install skipping post install script which requires husky
export VITE_ENABLE_REPORT_ISSUE=true
export VITE_I18N_FALLBACK_LANGUAGE='en'
export VITE_I18N_SUPPORTED_LANGUAGES='en|en-US|es|es-MX|it'

yarn install --production=false --ignore-scripts --frozen-lockfile
yarn build

# remove everything but backend/dist and .git files
find . -mindepth 1 \
  ! -path "./backend/dist*" \
  ! -path "./.git*" \
  ! -path "./.github*" \
  ! -name ".gitignore" \
  ! -name ".gitattributes" \
  ! -name ".gitmodules" \
  -exec rm -rf {} +

# log on the console the remaining files for verification
echo "Remaining files after cleanup:"
find . -mindepth 1 -maxdepth 2