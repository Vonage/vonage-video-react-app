import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { makeInternalErrorHandler, makeUnauthorizedErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import { isApplicationError } from '@common/errors/assertions';
import { getCookieValue } from '@node/helpers';
import loadConfig from '../../helpers/config';
import getSessionStorageService from '../../sessionStorageService';
import type { SessionStorage } from '../../storage/sessionStorage';
import { SESSION_COOKIE_NAME } from '../../routes/auth/constants';
import TokenIntrospectionResponseSchema from './schemas/TokenIntrospectionResponse.schema';

type ActiveTokenIntrospectionResponse = {
  active: true;
  sub: string;
  client_id?: string;
  email?: string;
};

type RequestWithTokenAuth = Request & {
  user?: ActiveTokenIntrospectionResponse;
};

/**
 * Builds an Express middleware that validates the caller's OIDC access token against
 * the configured provider's introspection endpoint. Opt-in via AUTH_ENABLED — a no-op
 * otherwise, preserving current behavior for deployments not yet on OIDC auth.
 *
 * Reads config.ts once, at construction time (not per request), so a misconfigured
 * deployment fails to start instead of 500ing on every request.
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
  const {
    oidcIssuerUrl,
    oidcClientId,
    authHeaderName,
    authScheme,
    introspectPath,
    introspectionTimeoutMs,
  } = authConfig;
  const sessionService = getSessionStorageService();

  return async function handleRequest(
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> {
    if (excludedPaths.has(req.path)) {
      next();
      return;
    }

    try {
      const accessToken = await extractAccessToken(req, {
        authHeaderName,
        authScheme,
        sessionService,
      });

      if (!accessToken) {
        throw makeUnauthorizedErrorHandler('Missing access token')(
          new Error(`No access token in the "${authHeaderName}" header`)
        );
      }

      const introspectionResponse = await assertResult(
        () =>
          axios.post(
            `${oidcIssuerUrl}${introspectPath}`,
            new URLSearchParams({
              token: accessToken,
              client_id: oidcClientId,
              token_type_hint: 'access_token',
            }),
            {
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              timeout: introspectionTimeoutMs,
            }
          ),
        makeUnauthorizedErrorHandler('Token introspection request to the identity provider failed')
      );

      const parsedIntrospection = TokenIntrospectionResponseSchema.safeParse(
        introspectionResponse.data
      );

      if (!parsedIntrospection.success) {
        throw makeUnauthorizedErrorHandler('Token introspection response failed schema validation')(
          new Error('Introspection response failed schema validation')
        );
      }

      const introspectionData = parsedIntrospection.data;

      // Beyond "active", confirm the token was actually issued to this application. This
      // tenant has no Custom Authorization Server, so `client_id` (not `aud`) is the reliable
      // signal — without this check, a valid token from a different app in the same org would
      // pass.
      const isTokenValidForThisApp =
        introspectionData.active === true && introspectionData.client_id === oidcClientId;

      if (!isTokenValidForThisApp) {
        const rejectionReason = introspectionData.active
          ? 'Token issued for a different client_id'
          : 'Token inactive or expired';

        throw makeUnauthorizedErrorHandler(rejectionReason)(new Error(rejectionReason));
      }

      (req as RequestWithTokenAuth).user = introspectionData;
      next();
    } catch (error) {
      if (isApplicationError(error)) {
        next(error);
        return;
      }

      next(makeInternalErrorHandler('Unexpected error in authMiddleware')(error));
    }
  };
}

export default authMiddleware;

/**
 * Mobile sends the token directly as a Bearer header. Web never sees the real token — the
 * browser only carries an opaque session-id cookie, which this resolves to the access token
 * the `/api/auth/callback/okta` route stored server-side via `SessionStorage`.
 */
async function extractAccessToken(
  req: Request,
  {
    authHeaderName,
    authScheme,
    sessionService,
  }: {
    authHeaderName: string;
    authScheme: string;
    sessionService: SessionStorage;
  }
): Promise<string | undefined> {
  const headerValue = req.headers[authHeaderName.toLowerCase()];
  const authorizationHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const schemePrefix = `${authScheme.toLowerCase()} `;

  if (authorizationHeader?.toLowerCase().startsWith(schemePrefix)) {
    return authorizationHeader.slice(schemePrefix.length).trim();
  }

  const sessionId = getCookieValue({ cookieHeader: req.headers.cookie, name: SESSION_COOKIE_NAME });

  if (!sessionId) return undefined;

  const accessToken = await sessionService.getAccessToken({ sessionId });

  return accessToken ?? undefined;
}
