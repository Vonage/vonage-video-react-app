import { createHash } from 'node:crypto';

/**
 * PKCE S256 code challenge (RFC 7636): base64url(sha256(code_verifier)).
 */
function computeCodeChallenge({ codeVerifier }: { codeVerifier: string }): string {
  return createHash('sha256').update(codeVerifier).digest('base64url');
}

export default computeCodeChallenge;
