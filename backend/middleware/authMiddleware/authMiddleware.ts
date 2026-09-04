import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { makeInternalErrorHandler, makeUnauthorizedErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import { isApplicationError } from '@common/errors/assertions';
import loadConfig from '../../helpers/config';
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
      const accessToken = extractAccessToken(req, { authHeaderName, authScheme });

      if (!accessToken) {
        throw makeUnauthorizedErrorHandler('Missing access token')(
          new Error(`No access token in the "${authHeaderName}" header`)
        );
      }

      // TODO(VIDSOL-1153): IAM-190121 hasn't confirmed yet whether VERA Web is provisioned in
      // Okta as an SPA or a Confidential Client. This assumes SPA (public client, no secret).
      // If it turns out to be Confidential, add `client_secret: process.env.OIDC_CLIENT_SECRET` below.
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

      const introspectionData = assertResult(
        () => TokenIntrospectionResponseSchema.parse(introspectionResponse.data),
        makeUnauthorizedErrorHandler('Token introspection response is missing or invalid')
      );

      // Beyond "active", confirm the token was actually issued to this application. This
      // tenant has no Custom Authorization Server, so `client_id` (not `aud`) is the reliable
      // signal without this check, a valid token from a different app in the same org would
      // pass. Assumes one shared client id across mobile/web; revisit if VIDSOL-860 registers
      // a separate web client id.
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

function extractAccessToken(
  req: Request,
  { authHeaderName, authScheme }: { authHeaderName: string; authScheme: string }
): string | undefined {
  const headerValue = req.headers[authHeaderName.toLowerCase()];
  const authorizationHeader = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  const schemePrefix = `${authScheme.toLowerCase()} `;

  if (authorizationHeader?.toLowerCase().startsWith(schemePrefix)) {
    return authorizationHeader.slice(schemePrefix.length).trim();
  }

  return undefined;
}
