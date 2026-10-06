import type { Response } from 'express';
import type { TokenExchangeResponse } from '../schemas/TokenExchangeResponse.schema';
import type { SessionCookie } from '../schemas/SessionCookie.schema';
import type { IdTokenCookie } from '../schemas/IdTokenCookie.schema';
import type { EnabledAuthConfig } from '../../../middleware/authMiddleware/schemas/AuthConfig.schema';
import { SIGN_OUT_PATH } from '../constants';
import encryptCookiePayload from './encryptCookiePayload';
import buildAuthCookieOptions from './buildAuthCookieOptions';

/**
 * Writes the session from a token endpoint response (code exchange or refresh). Providers that
 * don't rotate refresh tokens omit `refresh_token` on refresh, so the previous one is kept.
 */
function writeSessionCookies({
  res,
  tokenResponse,
  previousRefreshToken,
  authConfig: { authCookieSecret, authSessionCookieName, authIdTokenCookieName },
}: {
  res: Response;
  tokenResponse: TokenExchangeResponse;
  previousRefreshToken: string | undefined;
  authConfig: EnabledAuthConfig;
}): void {
  const refreshToken = tokenResponse.refresh_token ?? previousRefreshToken;

  const session: SessionCookie = {
    accessToken: tokenResponse.access_token,
    accessTokenExpiresAt: Date.now() + tokenResponse.expires_in * 1000,
    ...(refreshToken ? { refreshToken } : {}),
  };

  // RFC 6749 has no refresh-token lifetime field; without one this is a browser-session cookie.
  const maxAge = (() => {
    if (!refreshToken) return tokenResponse.expires_in * 1000;

    const refreshTokenLifetimeSeconds =
      tokenResponse.refresh_expires_in ?? tokenResponse.refresh_token_expires_in;

    return refreshTokenLifetimeSeconds === undefined
      ? undefined
      : refreshTokenLifetimeSeconds * 1000;
  })();

  res.cookie(
    authSessionCookieName,
    encryptCookiePayload({ payload: session, secret: authCookieSecret }),
    buildAuthCookieOptions({ path: '/', maxAge })
  );

  if (!tokenResponse.id_token) return;

  const idTokenCookie: IdTokenCookie = { idToken: tokenResponse.id_token };

  res.cookie(
    authIdTokenCookieName,
    encryptCookiePayload({ payload: idTokenCookie, secret: authCookieSecret }),
    buildAuthCookieOptions({ path: SIGN_OUT_PATH, maxAge })
  );
}

export default writeSessionCookies;
