import type { EnabledAuthConfig } from '../schemas/AuthConfig.schema';
import type { ActiveTokenIntrospectionResponse } from '../schemas/TokenIntrospectionResponse.schema';
import type { SessionCookie } from '../../../routes/auth/schemas/SessionCookie.schema';
import type { TokenExchangeResponse } from '../../../routes/auth/schemas/TokenExchangeResponse.schema';
import { makeSignInRequiredErrorHandler } from '../errors/SignInRequiredError';
import introspectAccessToken from './introspectAccessToken';
import verifyActiveToken from './verifyActiveToken';
import refreshAccessToken from './refreshAccessToken';

export type CookieSessionOutcome =
  | { status: 'valid'; user: ActiveTokenIntrospectionResponse }
  | {
      status: 'refreshed';
      tokenResponse: TokenExchangeResponse;
      user: ActiveTokenIntrospectionResponse;
    };

/**
 * Refreshes ahead of expiry, or when introspection reports the token inactive. Refresh errors that
 * aren't a rejection propagate as provider failures and never become a sign-in redirect.
 */
async function authenticateCookieSession({
  session,
  authConfig,
}: {
  session: SessionCookie;
  authConfig: EnabledAuthConfig;
}): Promise<CookieSessionOutcome> {
  const millisecondsUntilExpiry = session.accessTokenExpiresAt - Date.now();
  const isInsideRefreshWindow =
    millisecondsUntilExpiry <= authConfig.authRefreshWindowSeconds * 1000;

  if (session.refreshToken && isInsideRefreshWindow) {
    return refreshOrKeepLiveToken({
      session,
      refreshToken: session.refreshToken,
      authConfig,
      isAccessTokenExpired: millisecondsUntilExpiry <= 0,
    });
  }

  if (millisecondsUntilExpiry <= 0) {
    throw makeSignInRequiredErrorHandler('Session expired')(null);
  }

  const introspectionData = await introspectAccessToken({
    accessToken: session.accessToken,
    authConfig,
  });

  if (!introspectionData.active && session.refreshToken) {
    return refreshOrKeepLiveToken({
      session,
      refreshToken: session.refreshToken,
      authConfig,
      isAccessTokenExpired: true,
    });
  }

  return {
    status: 'valid',
    user: verifyActiveToken({ introspectionData, clientId: authConfig.oidcClientId }),
  };
}

export default authenticateCookieSession;

/**
 * A rejected refresh while the access token is still live is the parallel-request case: another
 * request already rotated the refresh token and its response carries the new cookie.
 */
async function refreshOrKeepLiveToken({
  session,
  refreshToken,
  authConfig,
  isAccessTokenExpired,
}: {
  session: SessionCookie;
  refreshToken: string;
  authConfig: EnabledAuthConfig;
  isAccessTokenExpired: boolean;
}): Promise<CookieSessionOutcome> {
  const refreshOutcome = await refreshAccessToken({ refreshToken, authConfig });

  if (refreshOutcome.status === 'refreshed') {
    const refreshedIntrospectionData = await introspectAccessToken({
      accessToken: refreshOutcome.tokenResponse.access_token,
      authConfig,
    });

    return {
      status: 'refreshed',
      tokenResponse: refreshOutcome.tokenResponse,
      user: verifyActiveToken({
        introspectionData: refreshedIntrospectionData,
        clientId: authConfig.oidcClientId,
      }),
    };
  }

  if (isAccessTokenExpired) {
    throw makeSignInRequiredErrorHandler('Refresh token rejected and the session has expired')(
      null
    );
  }

  const introspectionData = await introspectAccessToken({
    accessToken: session.accessToken,
    authConfig,
  });

  return {
    status: 'valid',
    user: verifyActiveToken({ introspectionData, clientId: authConfig.oidcClientId }),
  };
}
