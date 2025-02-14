 #!/bin/bash
# run install skipping post install script which requires husky
yarn install --ignore-scripts

yarn build
