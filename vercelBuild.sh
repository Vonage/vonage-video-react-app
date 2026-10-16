#!/bin/bash
set -e

# Build command for Vercel (see vercel.json). Produces .vercel/output using the Build Output API.
source ./env.sh

yarn build vercel
