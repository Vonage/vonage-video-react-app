# run install skipping post install script which requires husky
yarn install --production=false --ignore-scripts --frozen-lockfile
yarn build

# copy config file to the build output
if [ -f ./config.json ]; then
  cp ./config.json ./backend/dist/config.json
else
  cp ./config.example.json ./backend/dist/config.json
fi

# copy env file to the build output (FAIL if missing)
if [ -f ./backend/.env ]; then
  cp ./backend/.env ./backend/dist/.env
else
  echo "❌ ERROR: ./backend/.env file not found"
  exit 1
fi

# copy VCR manifest to the build output (FAIL if missing)
if [ -f ./vcr-dev.yml ]; then
  cp ./vcr-dev.yml ./backend/dist/vcr-dev.yml
else
  echo "❌ ERROR: ./vcr-dev.yml not found"
  exit 1
fi

# copy vcr-dev.yml manifest to the build output (FAIL if missing)
if [ -f ./vcr-dev.yml ]; then
  cp ./vcr-dev.yml ./backend/dist/vcr-dev.yml
else
  echo "❌ ERROR: ./vcr-dev.yml not found"
  exit 1
fi

echo ""
echo "Successfully prepared backend/dist:"
find backend/dist -print
