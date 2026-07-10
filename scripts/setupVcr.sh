#!/bin/bash
# Setup script for VCR deployment
# This script helps configure the remaining secrets and files needed for deployment

set -e

echo "=== Vonage Video App VCR Setup ==="
echo ""

# Check if VONAGE_PRIVATE_KEY is needed
if grep -q "REPLACE_WITH_YOUR_SECRET" backend/.env; then
  echo "✓ VONAGE_APP_ID is already set in backend/.env"
else
  echo "ℹ VONAGE_APP_ID not set in backend/.env"
fi

echo ""
echo "ℹ VCR Secrets already created:"
echo "  - VIDEO_SERVICE_PROVIDER"
echo "  - VONAGE_APP_ID" 
echo "  - SESSION_KEY_SECRET"
echo "  - ENABLE_REPORT_ISSUE"
echo "  - DEVICE_SELECTION"
echo ""

# Check if VONAGE_PRIVATE_KEY secret exists
PRIV_KEY_EXISTS=$(vcr secret list 2>/dev/null | grep -c "VONAGE_PRIVATE_KEY" || true)
if [ "$PRIV_KEY_EXISTS" -gt 0 ]; then
  echo "ℹ VONAGE_PRIVATE_KEY secret already exists. You may need to update it with the correct key."
  echo ""
  echo "To update the key, run:"
  echo "  vcr secret update -n VONAGE_PRIVATE_KEY --filename private_key.pem"
  echo ""
  echo "Or set it interactively:"
  echo "  vcr secret update -n VONAGE_PRIVATE_KEY"
else
  echo "ℹ VONAGE_PRIVATE_KEY secret needs to be created."
  echo ""
  echo "To create it, run:"
  echo "  vcr secret create -n VONAGE_PRIVATE_KEY --filename private_key.pem"
  echo ""
  echo "Or set it interactively:"
  echo "  vcr secret create -n VONAGE_PRIVATE_KEY"
fi

echo ""
echo "=== Next Steps ==="
echo ""
echo "1. Set the VONAGE_PRIVATE_KEY secret (if not already set):"
echo "   vcr secret update -n VONAGE_PRIVATE_KEY"
echo ""
echo "2. Optional: Update SESSION_KEY_SECRET in backend/.env for local development"
echo "   SESSION_KEY_SECRET=$(openssl rand -hex 32)"
echo ""
echo "3. Deploy to VCR:"
echo "   yarn vcr:dev"
echo ""
echo "Or alternatively:"
echo "   sh vcrBuild.dev.sh && cd ./backend/dist && vcr deploy -f vcr-dev.yml && cd ../.."
echo ""
