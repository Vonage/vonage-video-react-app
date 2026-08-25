import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { makeInternalErrorHandler, makeUnauthorizedErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import loadConfig from '../../helpers/config';

const BEARER_PREFIX = 'bearer ';
const INTROSPECT_PATH = '/oauth2/v1/introspect';
const INTROSPECTION_TIMEOUT_MS = 5000;

const UNAUTHORIZED_MESSAGE =
  'Token inactive, expired, not issued for this application, or introspection failed';

type ActiveTokenIntrospectionResponse = {
  active: true;
  sub: string;
  client_id?: string;
  email?: string;
  [claim: string]: unknown;
};

type InactiveTokenIntrospectionResponse = {
  active: false;
};

type TokenIntrospectionResponse =
  | ActiveTokenIntrospectionResponse
  | InactiveTokenIntrospectionResponse;

type RequestWithTokenAuth = Request & {
  session?: { accessToken?: string };
  user?: ActiveTokenIntrospectionResponse;
};

/**
 * Validates the caller's OIDC access token against the configured provider's
 * introspection endpoint. Opt-in via AUTH_ENABLED a no-op otherwise,
 * preserving current behavior for deployments not yet on OIDC auth.
 */
async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  // Checked directly (not via loadConfig) so the no-op path never depends on
  // unrelated config (e.g. video provider credentials) being valid.
  const isAuthEnabled = process.env.AUTH_ENABLED === 'true';

  if (!isAuthEnabled) {
    next();
    return;
  }

  try {
    const config = assertResult(
      () => loadConfig(),
      makeInternalErrorHandler('Token authentication is misconfigured')
    );

    if (!config.authEnabled) {
      next();
      return;
    }

    const { oidcIssuerUrl, oidcClientId } = config;

    const accessToken = extractAccessToken(req);

    if (!accessToken) {
      throw makeUnauthorizedErrorHandler('Missing access token')(
        new Error('No access token in Bearer header or session')
      );
    }

    // TODO(VIDSOL-1153): IAM-190121 hasn't confirmed yet whether VERA Web is provisioned in
    // Okta as an SPA or a Confidential Client. This assumes SPA (public client, no secret).
    // If it turns out to be Confidential, add `client_secret: process.env.OIDC_CLIENT_SECRET` below.
    const introspectionResponse = await assertResult(
      () =>
        axios.post<TokenIntrospectionResponse>(
          `${oidcIssuerUrl}${INTROSPECT_PATH}`,
          new URLSearchParams({
            token: accessToken,
            client_id: oidcClientId,
            token_type_hint: 'access_token',
          }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: INTROSPECTION_TIMEOUT_MS,
          }
        ),
      makeUnauthorizedErrorHandler(UNAUTHORIZED_MESSAGE)
    );

    // Beyond "active", confirm the token was actually issued to this application. This
    // tenant has no Custom Authorization Server, so `client_id` (not `aud`) is the reliable
    // signal — without this check, a valid token from a different app in the same org would
    // pass. Assumes one shared client id across mobile/web; revisit if VIDSOL-860 registers
    // a separate web client id.
    const isTokenValidForThisApp =
      introspectionResponse.data.active === true &&
      introspectionResponse.data.client_id === oidcClientId;

    if (!isTokenValidForThisApp) {
      throw makeUnauthorizedErrorHandler(UNAUTHORIZED_MESSAGE)(
        new Error('Token inactive or issued for a different client_id')
      );
    }

    (req as RequestWithTokenAuth).user =
      introspectionResponse.data as ActiveTokenIntrospectionResponse;
    next();
  } catch (error) {
    next(error);
  }
}

export default authMiddleware;

function extractAccessToken(req: Request): string | undefined {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader?.toLowerCase().startsWith(BEARER_PREFIX)) {
    return authorizationHeader.slice(BEARER_PREFIX.length).trim();
  }

  // Session fallback for the web BFF login flow (VIDSOL-860, not yet built). Dead code
  // today: no session middleware is registered in server.ts, so req.session is always
  // undefined until that ticket lands.
  return (req as RequestWithTokenAuth).session?.accessToken;
}
