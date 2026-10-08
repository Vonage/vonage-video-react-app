import { randomBytes } from 'node:crypto';

/**
 * Cryptographically random, URL-safe token — used for the PKCE `state`/`code_verifier`,
 * the auth-transaction id, and the session id. 32 bytes of entropy, base64url-encoded
 * (43 chars), comfortably satisfies PKCE's `code_verifier` length requirement (RFC 7636).
 */
function generateOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

export default generateOpaqueToken;
