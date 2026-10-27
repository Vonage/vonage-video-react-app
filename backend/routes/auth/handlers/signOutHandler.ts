import type { NextFunction, Request, Response } from 'express';
import { makeBadRequestErrorHandler, makeNotFoundErrorHandler } from '@api-lib/errors';
import tryCatch from '@common/execution/tryCatch';
import loadConfig from '../../../helpers/config';
import assertAllowedOrigin from '../../../middleware/authMiddleware/helpers/assertAllowedOrigin';
import readBearerToken from '../../../middleware/authMiddleware/helpers/readBearerToken';
import readCookiePayload from '../helpers/readCookiePayload';
import clearSessionCookies from '../helpers/clearSessionCookies';
import revokeTokens from '../helpers/revokeTokens';
import SessionCookieSchema from '../schemas/SessionCookie.schema';
import IdTokenCookieSchema from '../schemas/IdTokenCookie.schema';
import SignOutRequestBodySchema from '../schemas/SignOutRequestBody.schema';

/**
 * `POST /auth/signout`. Revocation is best effort: sign-out always completes.
 *
 * - Bearer (mobile): revokes the access token and the body's `refresh_token`, then responds 204.
 *   The app ends its own provider session.
 * - Cookie (web): revokes the session's tokens, clears the cookies and redirects (303) to the
 *   provider's end-session endpoint (OIDC RP-Initiated Logout).
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
    oidcEndSessionEndpoint,
    oidcPostLogoutRedirectUri,
    authCookieSecret,
    authSessionCookieName,
    authIdTokenCookieName,
    authHeaderName,
    authScheme,
    corsAllowedOrigins,
  } = authConfig;

  return async function handleRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const { error: originError } = tryCatch(() =>
      assertAllowedOrigin({ req, allowedOrigins: corsAllowedOrigins })
    );

    if (originError) {
      next(originError);
      return;
    }

    const bearerToken = readBearerToken({ req, authHeaderName, authScheme });

    if (bearerToken) {
      const body = SignOutRequestBodySchema.safeParse(req.body ?? {});

      if (!body.success) {
        next(makeBadRequestErrorHandler('refresh_token must be a non-empty string')(body.error));
        return;
      }

      await revokeTokens({
        tokens: [
          { token: body.data.refresh_token, tokenTypeHint: 'refresh_token' },
          { token: bearerToken, tokenTypeHint: 'access_token' },
        ],
        authConfig,
      });

      res.status(204).end();
      return;
    }

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

    await revokeTokens({
      tokens: [
        { token: session?.refreshToken, tokenTypeHint: 'refresh_token' },
        { token: session?.accessToken, tokenTypeHint: 'access_token' },
      ],
      authConfig,
    });

    clearSessionCookies({ res, authConfig });

    const endSessionUrl = new URL(oidcEndSessionEndpoint);
    endSessionUrl.searchParams.set('client_id', oidcClientId);
    endSessionUrl.searchParams.set('post_logout_redirect_uri', oidcPostLogoutRedirectUri);
    if (idTokenCookie) endSessionUrl.searchParams.set('id_token_hint', idTokenCookie.idToken);

    res.redirect(303, endSessionUrl.toString());
  };
}

export default makeSignOutHandler;
