import { createHash, randomBytes } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { CALLBACK_URL, LOCAL_OIDC_CLIENT_ID, LOCAL_OIDC_URL } from '../constants';

/**
 * Runs the authorization code + PKCE flow against local-oidc directly, the way a mobile client
 * obtains the token it then sends as a Bearer header.
 */
async function requestAccessToken(request: APIRequestContext): Promise<string> {
  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url');

  const authorizeResponse = await request.get(`${LOCAL_OIDC_URL}/authorize`, {
    params: {
      response_type: 'code',
      client_id: LOCAL_OIDC_CLIENT_ID,
      redirect_uri: CALLBACK_URL,
      scope: 'openid profile email',
      state: 'e2e-mobile',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    },
    maxRedirects: 0,
  });

  const code = new URL(authorizeResponse.headers().location).searchParams.get('code');

  const tokenResponse = await request.post(`${LOCAL_OIDC_URL}/token`, {
    form: {
      grant_type: 'authorization_code',
      client_id: LOCAL_OIDC_CLIENT_ID,
      code,
      redirect_uri: CALLBACK_URL,
      code_verifier: codeVerifier,
    },
  });

  const { access_token: accessToken } = (await tokenResponse.json()) as { access_token: string };

  return accessToken;
}

export default requestAccessToken;
