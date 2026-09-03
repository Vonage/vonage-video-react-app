import type { NextFunction, Request, Response } from 'express';
import { makeInternalErrorHandler, makeNotFoundErrorHandler } from '@api-lib/errors';
import { isApplicationError } from '@common/errors/assertions';
import isVcr from '../../../middleware/isVcr';
import getSessionStorageService from '../../../sessionStorageService';
import loadConfig from '../../../helpers/config';
import generateOpaqueToken from '../helpers/generateOpaqueToken';
import computeCodeChallenge from '../helpers/computeCodeChallenge';
import isSafeReturnToPath from '../helpers/isSafeReturnToPath';
import readStringQueryParam from '../helpers/readStringQueryParam';
import {
  DEFAULT_RETURN_TO,
  OIDC_SCOPES,
  TRANSACTION_COOKIE_MAX_AGE_MS,
  TRANSACTION_COOKIE_NAME,
} from '../constants';

/**
 * Builds the `GET /auth/signin` handler — starts the Web BFF login flow: stashes a
 * PKCE/CSRF transaction server-side, hands the browser an opaque cookie referencing it,
 * and redirects to the identity provider.
 *
 * Reads config once at construction time, same fail-fast-at-startup pattern as
 * `authMiddleware`, rather than per request.
 */
function makeSignInHandler() {
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

  const { oidcIssuerUrl, authorizePath, oidcWebClientId, oidcWebRedirectUri } = authConfig;
  const sessionService = getSessionStorageService();

  return async function handleRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const requestedReturnTo = readStringQueryParam(req.query.returnTo);
      const returnTo =
        requestedReturnTo && isSafeReturnToPath(requestedReturnTo)
          ? requestedReturnTo
          : DEFAULT_RETURN_TO;

      const transactionId = generateOpaqueToken();
      const state = generateOpaqueToken();
      const codeVerifier = generateOpaqueToken();
      const codeChallenge = computeCodeChallenge({ codeVerifier });

      await sessionService.setAuthTransaction({ transactionId, state, codeVerifier, returnTo });

      res.cookie(TRANSACTION_COOKIE_NAME, transactionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isVcr,
        maxAge: TRANSACTION_COOKIE_MAX_AGE_MS,
        path: '/api/auth',
      });

      const authorizeUrl = new URL(`${oidcIssuerUrl}${authorizePath}`);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('client_id', oidcWebClientId);
      authorizeUrl.searchParams.set('redirect_uri', oidcWebRedirectUri);
      authorizeUrl.searchParams.set('scope', OIDC_SCOPES);
      authorizeUrl.searchParams.set('state', state);
      authorizeUrl.searchParams.set('code_challenge', codeChallenge);
      authorizeUrl.searchParams.set('code_challenge_method', 'S256');

      res.redirect(authorizeUrl.toString());
    } catch (error) {
      if (isApplicationError(error)) {
        next(error);
        return;
      }

      next(makeInternalErrorHandler('Unexpected error starting the OIDC sign-in flow')(error));
    }
  };
}

export default makeSignInHandler;
