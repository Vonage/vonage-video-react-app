import type { NextFunction, Request, Response } from 'express';
import { makeInternalErrorHandler, makeNotFoundErrorHandler } from '@api-lib/errors';
import { isApplicationError } from '@common/errors/assertions';
import loadConfig from '../../../helpers/config';
import generateOpaqueToken from '../helpers/generateOpaqueToken';
import computeCodeChallenge from '../helpers/computeCodeChallenge';
import isSafeReturnToPath from '../helpers/isSafeReturnToPath';
import readStringQueryParam from '../helpers/readStringQueryParam';
import encryptCookiePayload from '../helpers/encryptCookiePayload';
import buildAuthCookieOptions from '../helpers/buildAuthCookieOptions';
import readCallbackPath from '../helpers/readCallbackPath';
import type { AuthTransactionCookie } from '../schemas/AuthTransactionCookie.schema';
import { DEFAULT_RETURN_TO } from '../constants';

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

  const {
    oidcAuthorizationEndpoint,
    oidcClientId,
    oidcWebRedirectUri,
    oidcScopes,
    authCookieSecret,
    authTransactionCookieName,
    authTransactionMaxAgeSeconds,
  } = authConfig;

  const callbackPath = readCallbackPath({ oidcWebRedirectUri });

  return function handleRequest(req: Request, res: Response, next: NextFunction): void {
    try {
      const requestedReturnTo = readStringQueryParam(req.query.returnTo);
      const returnTo =
        requestedReturnTo && isSafeReturnToPath(requestedReturnTo)
          ? requestedReturnTo
          : DEFAULT_RETURN_TO;

      const transaction: AuthTransactionCookie = {
        state: generateOpaqueToken(),
        codeVerifier: generateOpaqueToken(),
        returnTo,
      };

      res.cookie(
        authTransactionCookieName,
        encryptCookiePayload({ payload: transaction, secret: authCookieSecret }),
        buildAuthCookieOptions({
          path: callbackPath,
          maxAge: authTransactionMaxAgeSeconds * 1000,
        })
      );

      const authorizeUrl = new URL(oidcAuthorizationEndpoint);
      authorizeUrl.searchParams.set('response_type', 'code');
      authorizeUrl.searchParams.set('client_id', oidcClientId);
      authorizeUrl.searchParams.set('redirect_uri', oidcWebRedirectUri);
      authorizeUrl.searchParams.set('scope', oidcScopes);
      authorizeUrl.searchParams.set('state', transaction.state);
      authorizeUrl.searchParams.set(
        'code_challenge',
        computeCodeChallenge({ codeVerifier: transaction.codeVerifier })
      );
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
