import type { NextFunction, Request, Response } from 'express';
import { isRecord } from '@common/assertions';
import { makeInternalErrorHandler } from '@api-lib/errors';
import { isApplicationError } from '@common/errors/assertions';
import loadConfig from '../../helpers/config';
import { SIGN_IN_PATH } from '../../routes/auth/constants';
import SessionCookieSchema from '../../routes/auth/schemas/SessionCookie.schema';
import readCookiePayload from '../../routes/auth/helpers/readCookiePayload';
import writeSessionCookies from '../../routes/auth/helpers/writeSessionCookies';
import clearSessionCookies from '../../routes/auth/helpers/clearSessionCookies';
import resolveResponseFormat from '../../helpers/resolveResponseFormat';
import type { ActiveTokenIntrospectionResponse } from './schemas/TokenIntrospectionResponse.schema';
import { makeSignInRequiredErrorHandler } from './errors/SignInRequiredError';
import readBearerToken from './helpers/readBearerToken';
import introspectAccessToken from './helpers/introspectAccessToken';
import verifyActiveToken from './helpers/verifyActiveToken';
import authenticateCookieSession from './helpers/authenticateCookieSession';

type RequestWithTokenAuth = Request & {
  user?: ActiveTokenIntrospectionResponse;
};

/**
 * Builds an Express middleware that authenticates every request through the configured OIDC
 * provider. Opt-in via AUTH_ENABLED — a no-op otherwise.
 *
 * - Bearer header (mobile): introspected on every request; never refreshed, never sets cookies.
 * - Encrypted session cookie (web): refreshed ahead of expiry when a refresh token exists.
 *
 * Unauthenticated HTML page requests (GET, resolved via resolveResponseFormat) are redirected to
 * the sign-in flow; other unauthenticated requests are rejected with 401. Identity-provider
 * failures are never redirected, so an outage cannot cause a sign-in loop.
 *
 * Reads config once, at construction time, so a misconfigured deployment fails to start.
 *
 * @param options.excludedPaths - exact request paths (req.path) that skip auth entirely
 * (e.g. health checks, provider webhooks, .well-known files) — callers that structurally
 * cannot carry a user's token.
 */
function authMiddleware(options: { excludedPaths?: Iterable<string> } = {}) {
  const authConfig = loadConfig();

  if (!authConfig.authEnabled) {
    return function handleRequest(_req: Request, _res: Response, next: NextFunction): void {
      next();
    };
  }

  const excludedPaths = new Set(options.excludedPaths ?? []);
  const { oidcClientId, authHeaderName, authScheme, authCookieSecret, authSessionCookieName } =
    authConfig;

  return async function handleRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (excludedPaths.has(req.path)) {
      next();
      return;
    }

    const bearerToken = readBearerToken({ req, authHeaderName, authScheme });

    try {
      if (bearerToken) {
        const introspectionData = await introspectAccessToken({
          accessToken: bearerToken,
          authConfig,
        });

        (req as RequestWithTokenAuth).user = verifyActiveToken({
          introspectionData,
          clientId: oidcClientId,
        });
        next();
        return;
      }

      const session = readCookiePayload({
        req,
        name: authSessionCookieName,
        secret: authCookieSecret,
        schema: SessionCookieSchema,
      });

      if (!session) {
        throw makeSignInRequiredErrorHandler(
          `Missing access token in the "${authHeaderName}" header or the session cookie`
        )(null);
      }

      const sessionOutcome = await authenticateCookieSession({ session, authConfig });

      if (sessionOutcome.status === 'refreshed') {
        writeSessionCookies({
          res,
          tokenResponse: sessionOutcome.tokenResponse,
          previousRefreshToken: session.refreshToken,
          authConfig,
        });
      } else {
        (req as RequestWithTokenAuth).user = sessionOutcome.user;
      }

      next();
    } catch (error) {
      const isSignInRequired = isRecord(error) && error.isSignInRequired === true;

      if (isSignInRequired && !bearerToken) clearSessionCookies({ res, authConfig });

      const isSignInRequiredPageRequest =
        isSignInRequired && req.method === 'GET' && resolveResponseFormat(req) === 'html';

      if (isSignInRequiredPageRequest) {
        res.redirect(`${SIGN_IN_PATH}?returnTo=${encodeURIComponent(req.originalUrl)}`);
        return;
      }

      if (isApplicationError(error)) {
        next(error);
        return;
      }

      next(makeInternalErrorHandler('Unexpected error in authMiddleware')(error));
    }
  };
}

export default authMiddleware;
