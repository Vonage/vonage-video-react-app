import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { StatusCode } from 'status-code-enum';
import tryCatch from '@common/execution/tryCatch';

const BEARER_PREFIX = 'bearer ';
const INTROSPECT_PATH = '/oauth2/v1/introspect';
const INTROSPECTION_TIMEOUT_MS = 5000;

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
 * introspection endpoint. Opt-in via AUTH_ENABLED — a no-op otherwise,
 * preserving current behavior for deployments not yet on OIDC auth.
 */
async function tokenAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const isAuthEnabled = process.env.AUTH_ENABLED === 'true';

  if (!isAuthEnabled) {
    next();
    return;
  }

  const accessToken = extractAccessToken(req);

  if (!accessToken) {
    res.status(StatusCode.ClientErrorUnauthorized).json({ error: 'Missing access token' });
    return;
  }

  const issuerUrl = process.env.OIDC_ISSUER_URL;
  const clientId = process.env.OIDC_CLIENT_ID;

  if (!issuerUrl || !clientId) {
    console.error(
      '[tokenAuthMiddleware] AUTH_ENABLED is true but OIDC_ISSUER_URL/OIDC_CLIENT_ID is not set'
    );
    res
      .status(StatusCode.ServerErrorInternal)
      .json({ error: 'Token authentication is misconfigured' });
    return;
  }

  // TODO(VIDSOL-1153): IAM-190121 hasn't confirmed yet whether VERA Web is provisioned in
  // Okta as an SPA or a Confidential Client. This assumes SPA (public client, no secret).
  // If it turns out to be Confidential, add `client_secret: process.env.OIDC_CLIENT_SECRET` below.
  const { result, error } = await tryCatch(() =>
    axios.post<TokenIntrospectionResponse>(
      `${issuerUrl}${INTROSPECT_PATH}`,
      new URLSearchParams({
        token: accessToken,
        client_id: clientId,
        token_type_hint: 'access_token',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: INTROSPECTION_TIMEOUT_MS,
      }
    )
  );

  // Beyond "active", confirm the token was actually issued to this application. This
  // tenant has no Custom Authorization Server, so `client_id` (not `aud`) is the reliable
  // signal — without this check, a valid token from a different app in the same org would
  // pass. Assumes one shared client id across mobile/web; revisit if VIDSOL-860 registers
  // a separate web client id.
  const isTokenValidForThisApp =
    !error && result?.data.active === true && result.data.client_id === clientId;

  if (!isTokenValidForThisApp) {
    res.status(StatusCode.ClientErrorUnauthorized).json({
      error: 'Token inactive, expired, not issued for this application, or introspection failed',
    });
    return;
  }

  (req as RequestWithTokenAuth).user = result.data as ActiveTokenIntrospectionResponse;
  next();
}

export default tokenAuthMiddleware;

function extractAccessToken(req: Request): string | undefined {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader?.toLowerCase().startsWith(BEARER_PREFIX)) {
    return authorizationHeader.slice(BEARER_PREFIX.length).trim();
  }

  return (req as RequestWithTokenAuth).session?.accessToken;
}
