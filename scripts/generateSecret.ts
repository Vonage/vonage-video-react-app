#!/usr/bin/env node
import { randomBytes } from 'node:crypto';

const SECRET_LENGTH_BYTES = 32;

/**
 * Prints a cryptographically random 32-byte secret, base64 encoded, for SESSION_KEY_SECRET or
 * AUTH_COOKIE_SECRET. Run it once per secret and per environment.
 *
 * Usage:
 * - yarn generate:secret
 */
function main() {
  console.log(randomBytes(SECRET_LENGTH_BYTES).toString('base64'));
}

main();
