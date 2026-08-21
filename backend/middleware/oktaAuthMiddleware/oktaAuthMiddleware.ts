import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import { StatusCode } from 'status-code-enum';
import tryCatch from '@common/execution/tryCatch';

const BEARER_PREFIX = 'Bearer ';
const OKTA_INTROSPECT_PATH = '/oauth2/v1/introspect';

type OktaActiveIntrospectionResponse = {
  active: true;
  sub: string;
  email?: string;
  [claim: string]: unknown;
};

type OktaInactiveIntrospectionResponse = {
  active: false;
};

type OktaIntrospectionResponse =
  | OktaActiveIntrospectionResponse
  | OktaInactiveIntrospectionResponse;

type RequestWithOktaAuth = Request & {
  session?: { accessToken?: string };
  user?: OktaActiveIntrospectionResponse;
};

/**
 * Validates the caller's Okta access token against the org introspection endpoint.
 * Opt-in via OKTA_AUTH_ENABLED — a no-op otherwise, preserving current behavior
 * for deployments not yet on Okta.
 */
async function oktaAuthMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  const isOktaAuthEnabled = process.env.OKTA_AUTH_ENABLED === 'true';

  if (!isOktaAuthEnabled) {
    next();
    return;
  }

  const accessToken = extractAccessToken(req);

  if (!accessToken) {
    res.status(StatusCode.ClientErrorUnauthorized).json({ error: 'Missing access token' });
    return;
  }

  const introspectionUrl = `${process.env.OKTA_ISSUER_URL ?? ''}${OKTA_INTROSPECT_PATH}`;

  // TODO(VIDSOL-1153): IAM-190121 hasn't confirmed yet whether VERA Web is an Okta SPA
  // or a Confidential Client. This assumes SPA (public client, no secret). If it turns
  // out to be Confidential, add `client_secret: process.env.OKTA_CLIENT_SECRET` below.
  const { result, error } = await tryCatch(() =>
    axios.post<OktaIntrospectionResponse>(
      introspectionUrl,
      new URLSearchParams({
        token: accessToken,
        client_id: process.env.OKTA_CLIENT_ID ?? '',
        token_type_hint: 'access_token',
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
  );

  const isTokenActive = !error && result?.data.active === true;

  if (!isTokenActive) {
    res
      .status(StatusCode.ClientErrorUnauthorized)
      .json({ error: 'Token inactive, expired, or introspection failed' });
    return;
  }

  (req as RequestWithOktaAuth).user = result.data as OktaActiveIntrospectionResponse;
  next();
}

export default oktaAuthMiddleware;

function extractAccessToken(req: Request): string | undefined {
  const authorizationHeader = req.headers.authorization;

  if (authorizationHeader?.startsWith(BEARER_PREFIX)) {
    return authorizationHeader.slice(BEARER_PREFIX.length);
  }

  return (req as RequestWithOktaAuth).session?.accessToken;
}
