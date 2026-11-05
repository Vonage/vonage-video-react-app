import type { NextFunction, Request, Response } from 'express';
import { isNil, isRecord } from '@common/assertions';
import { tryCatch } from '@common/execution';
import { makeInternalErrorHandler } from '@api-lib/errors';
import { isApplicationError } from '@common/errors/assertions';
import loadConfig from '../../helpers/config';
import { SIGN_IN_PATH } from '../../routes/auth/constants';
import SessionCookieSchema, {
  type SessionCookie,
} from '../../routes/auth/schemas/SessionCookie.schema';
import readCookiePayload from '../../routes/auth/helpers/readCookiePayload';
import writeSessionCookies from '../../routes/auth/helpers/writeSessionCookies';
import clearSessionCookies from '../../routes/auth/helpers/clearSessionCookies';
import resolveResponseFormat from '../../helpers/resolveResponseFormat';
import type { EnabledAuthConfig } from './schemas/AuthConfig.schema';
import type { ActiveTokenIntrospectionResponse } from './schemas/TokenIntrospectionResponse.schema';
import { makeSignInRequiredErrorHandler } from './errors/SignInRequiredError';
import readBearerToken from './helpers/readBearerToken';
import assertAllowedOrigin from './helpers/assertAllowedOrigin';
import introspectAccessToken from './helpers/introspectAccessToken';
import verifyActiveToken from './helpers/verifyActiveToken';
import authenticateCookieSession from './helpers/authenticateCookieSession';

export type RequestWithTokenAuth = Request & {
  user?: ActiveTokenIntrospectionResponse;
};

/**
 * Builds an Express middleware that authenticates every request through the configured OIDC
 * provider. Opt-in via AUTH_ENABLED — a no-op otherwise.
 *
 * - Bearer header (mobile): introspected on every request; never refreshed, never sets cookies.
 * - Encrypted session cookie (web): refreshed ahead of expiry when a refresh token exists.
 *
 * Unauthenticated HTML page requests (GET, resolved via resolveResponseFormat) without a Bearer
 * header are redirected to the sign-in flow; other unauthenticated requests are rejected with 401. Identity-provider
 * failures are never redirected, so an outage cannot cause a sign-in loop.
 *
 * Reads config once, at construction time, so a misconfigured deployment fails to start.
 *
 * @param options.excludedPaths - exact request paths (req.path) that skip auth entirely
 * (e.g. health checks, provider webhooks, .well-known files) — callers that structurally
 * cannot carry a user's token.
 * @param options.mode - 'required' rejects an unauthenticated request. 'optional' authenticates
 * when a credential is present and otherwise continues with no user, leaving the decision to
 * downstream authorization. Origin checks block in both modes.
 */
function authMiddleware(
  options: { excludedPaths?: Iterable<string>; mode?: 'required' | 'optional' } = {}
) {
  const authConfig = loadConfig();

  if (!authConfig.authEnabled) {
    return function handleRequest(_req: Request, _res: Response, next: NextFunction): void {
      next();
    };
  }

  const isOptional = options.mode === 'optional';
  const excludedPaths = new Set(options.excludedPaths ?? []);

  return async function handleRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    if (excludedPaths.has(req.path)) return next();

    const bearerToken = readBearerToken({
      req,
      authHeaderName: authConfig.authHeaderName,
      authScheme: authConfig.authScheme,
    });

    const { didFail: isOriginRejected, error: originError } = tryCatch(() =>
      assertAllowedOrigin({ req, allowedOrigins: authConfig.corsAllowedOrigins })
    );

    if (isOriginRejected) return next(wrapUnexpectedError(originError));

    const { didFail: hasAuthenticationFailed, error } = await tryCatch(() =>
      authenticateRequest({ req, res, bearerToken, authConfig, isOptional })
    );

    if (!hasAuthenticationFailed) return next();

    const hasNoValidCredential = isMissingOrRejectedCredentialError(error);
    const hasNoValidCookieSession = hasNoValidCredential && !bearerToken;

    if (hasNoValidCookieSession) clearSessionCookies({ res, authConfig });
    if (isOptional && hasNoValidCredential) return next();
    if (hasNoValidCookieSession && isPageRequest(req)) return redirectToSignIn({ req, res });

    next(toApplicationError(error));
  };
}

export default authMiddleware;

async function authenticateRequest({
  req,
  res,
  bearerToken,
  authConfig,
  isOptional,
}: {
  req: Request;
  res: Response;
  bearerToken: string | undefined;
  authConfig: EnabledAuthConfig;
  isOptional: boolean;
}): Promise<void> {
  if (bearerToken) {
    (req as RequestWithTokenAuth).user = await authenticateBearerToken({ bearerToken, authConfig });
    return;
  }

  const session = readSessionCookie({ req, authConfig });

  if (isNil(session) && isOptional) return;

  if (isNil(session)) {
    throw makeSignInRequiredErrorHandler(
      `Missing access token in the "${authConfig.authHeaderName}" header or the session cookie`
    )(null);
  }

  (req as RequestWithTokenAuth).user = await authenticateAndRefreshCookieSession({
    session,
    res,
    authConfig,
  });
}

async function authenticateBearerToken({
  bearerToken,
  authConfig,
}: {
  bearerToken: string;
  authConfig: EnabledAuthConfig;
}): Promise<ActiveTokenIntrospectionResponse> {
  const introspectionData = await introspectAccessToken({ accessToken: bearerToken, authConfig });

  return verifyActiveToken({ introspectionData, clientId: authConfig.oidcClientId });
}

function readSessionCookie({
  req,
  authConfig,
}: {
  req: Request;
  authConfig: EnabledAuthConfig;
}): SessionCookie | undefined {
  return readCookiePayload({
    req,
    name: authConfig.authSessionCookieName,
    secret: authConfig.authCookieSecret,
    schema: SessionCookieSchema,
  });
}

async function authenticateAndRefreshCookieSession({
  session,
  res,
  authConfig,
}: {
  session: SessionCookie;
  res: Response;
  authConfig: EnabledAuthConfig;
}): Promise<ActiveTokenIntrospectionResponse> {
  const sessionOutcome = await authenticateCookieSession({ session, authConfig });

  if (sessionOutcome.status === 'refreshed') {
    writeSessionCookies({
      res,
      tokenResponse: sessionOutcome.tokenResponse,
      previousRefreshToken: session.refreshToken,
      authConfig,
    });
  }

  return sessionOutcome.user;
}

function isMissingOrRejectedCredentialError(error: unknown): boolean {
  return isRecord(error) && error.isSignInRequired === true;
}

function isPageRequest(req: Request): boolean {
  return req.method === 'GET' && resolveResponseFormat(req) === 'html';
}

function redirectToSignIn({ req, res }: { req: Request; res: Response }): void {
  res.redirect(`${SIGN_IN_PATH}?returnTo=${encodeURIComponent(req.originalUrl)}`);
}

function toApplicationError(error: unknown) {
  if (isApplicationError(error)) return error;

  return wrapUnexpectedError(error);
}

function wrapUnexpectedError(error: unknown) {
  return makeInternalErrorHandler('Unexpected error in authMiddleware')(error);
}
