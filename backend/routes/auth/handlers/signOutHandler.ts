import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { makeNotFoundErrorHandler } from '@api-lib/errors';
import tryCatch from '@common/execution/tryCatch';
import loadConfig from '../../../helpers/config';
import readCookiePayload from '../helpers/readCookiePayload';
import clearSessionCookies from '../helpers/clearSessionCookies';
import SessionCookieSchema from '../schemas/SessionCookie.schema';
import IdTokenCookieSchema from '../schemas/IdTokenCookie.schema';

/**
 * Revokes the tokens (RFC 7009), clears the session cookies and ends the provider session
 * (OIDC RP-Initiated Logout). Revocation is best effort: sign-out always completes.
 */
function makeSignOutHandler() {
  const authConfig = loadConfig();

  if (!authConfig.authEnabled) {
    return function handleRequest(_req: Request, _res: Response, next: NextFunction): void {
      next(
        makeNotFoundErrorHandler('OIDC auth is not enabled on this deployment')(
          new Error('AUTH_ENABLED is not true')
        )
      );
    };
  }

  const {
    oidcClientId,
    oidcRevocationEndpoint,
    oidcEndSessionEndpoint,
    oidcPostLogoutRedirectUri,
    authCookieSecret,
    authSessionCookieName,
    authIdTokenCookieName,
    authProviderTimeoutMs,
  } = authConfig;

  return async function handleRequest(req: Request, res: Response): Promise<void> {
    const session = readCookiePayload({
      req,
      name: authSessionCookieName,
      secret: authCookieSecret,
      schema: SessionCookieSchema,
    });
    const idTokenCookie = readCookiePayload({
      req,
      name: authIdTokenCookieName,
      secret: authCookieSecret,
      schema: IdTokenCookieSchema,
    });

    if (session) {
      const tokensToRevoke = [
        { token: session.refreshToken, tokenTypeHint: 'refresh_token' },
        { token: session.accessToken, tokenTypeHint: 'access_token' },
      ].filter((entry): entry is { token: string; tokenTypeHint: string } => !!entry.token);

      await Promise.all(
        tokensToRevoke.map(({ token, tokenTypeHint }) =>
          tryCatch(() =>
            axios.post(
              oidcRevocationEndpoint,
              new URLSearchParams({
                token,
                token_type_hint: tokenTypeHint,
                client_id: oidcClientId,
              }),
              {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: authProviderTimeoutMs,
              }
            )
          )
        )
      );
    }

    clearSessionCookies({ res, authConfig });

    const endSessionUrl = new URL(oidcEndSessionEndpoint);
    endSessionUrl.searchParams.set('client_id', oidcClientId);
    endSessionUrl.searchParams.set('post_logout_redirect_uri', oidcPostLogoutRedirectUri);
    if (idTokenCookie) endSessionUrl.searchParams.set('id_token_hint', idTokenCookie.idToken);

    res.redirect(endSessionUrl.toString());
  };
}

export default makeSignOutHandler;
