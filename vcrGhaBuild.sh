#!/bin/bash
# This script is used to install dependencies and build the app in the machine used by VCR 
# rather than uploading the build built locally
# https://developer.vonage.com/en/vonage-cloud-runtime/guides/manifest#build-script

# run install skipping post install script which requires husky
export VITE_ENABLE_REPORT_ISSUE=true
export VITE_I18N_FALLBACK_LANGUAGE='en'
export VITE_I18N_SUPPORTED_LANGUAGES='en|es|es-MX'

yarn install --ignore-scripts

yarn build
