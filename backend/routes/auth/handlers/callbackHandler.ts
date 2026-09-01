import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import {
  makeInternalErrorHandler,
  makeNotFoundErrorHandler,
  makeThirdPartyErrorHandler,
  makeUnauthorizedErrorHandler,
} from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import { isApplicationError } from '@common/errors/assertions';
import { getCookieValue } from '@node/helpers';
import isVcr from '../../../middleware/isVcr';
import getSessionStorageService from '../../../sessionStorageService';
import loadConfig from '../../../helpers/config';
import generateOpaqueToken from '../helpers/generateOpaqueToken';
import { SESSION_COOKIE_NAME, TRANSACTION_COOKIE_NAME } from '../constants';
import TokenExchangeResponseSchema from '../schemas/TokenExchangeResponse.schema';

function readStringQueryParam(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

/**
 * Builds the `GET /api/auth/callback/okta` handler — exchanges the authorization code for
 * an access token (PKCE, no client secret), stores the token server-side, and hands the
 * browser an opaque session cookie. The real token never reaches the browser.
 *
 * Reads config once at construction time, same fail-fast-at-startup pattern as
 * `authMiddleware`, rather than per request.
 */
function makeCallbackHandler() {
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

  const { oidcIssuerUrl, tokenPath, oidcWebClientId, oidcWebRedirectUri } = authConfig;
  const sessionService = getSessionStorageService();

  return async function handleRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const oktaError = readStringQueryParam(req.query.error);

      if (oktaError) {
        throw makeUnauthorizedErrorHandler(`Okta rejected the login attempt: ${oktaError}`)(
          new Error(oktaError)
        );
      }

      const code = readStringQueryParam(req.query.code);
      const returnedState = readStringQueryParam(req.query.state);

      if (!code || !returnedState) {
        throw makeUnauthorizedErrorHandler('Callback is missing the "code" or "state" parameter')(
          new Error('Missing code or state query parameter')
        );
      }

      const transactionId = getCookieValue({
        cookieHeader: req.headers.cookie,
        name: TRANSACTION_COOKIE_NAME,
      });

      if (!transactionId) {
        throw makeUnauthorizedErrorHandler('Missing auth transaction cookie')(
          new Error('No auth transaction cookie on the OIDC callback request')
        );
      }

      const transaction = await sessionService.getAuthTransaction({ transactionId });

      if (!transaction) {
        throw makeUnauthorizedErrorHandler('Missing or expired auth transaction')(
          new Error('No auth transaction found for the transaction cookie')
        );
      }

      const isStateValid = transaction.state === returnedState;

      if (!isStateValid) {
        throw makeUnauthorizedErrorHandler('State parameter does not match — possible CSRF')(
          new Error('State mismatch on OIDC callback')
        );
      }

      const tokenResponse = await assertResult(
        () =>
          axios.post(
            `${oidcIssuerUrl}${tokenPath}`,
            new URLSearchParams({
              grant_type: 'authorization_code',
              code,
              redirect_uri: oidcWebRedirectUri,
              client_id: oidcWebClientId,
              code_verifier: transaction.codeVerifier,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          ),
        makeThirdPartyErrorHandler('Token exchange with the identity provider failed')
      );

      const parsedTokenResponse = TokenExchangeResponseSchema.safeParse(tokenResponse.data);

      if (!parsedTokenResponse.success) {
        throw makeUnauthorizedErrorHandler('Token exchange response failed schema validation')(
          new Error('Token exchange response failed schema validation')
        );
      }

      const { access_token: accessToken, expires_in: expiresInSeconds } = parsedTokenResponse.data;

      const sessionId = generateOpaqueToken();

      await sessionService.setAccessToken({ sessionId, accessToken });
      await sessionService.deleteAuthTransaction({ transactionId });

      res.clearCookie(TRANSACTION_COOKIE_NAME, { path: '/api/auth' });

      res.cookie(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: isVcr,
        maxAge: expiresInSeconds * 1000,
        path: '/',
      });

      res.redirect('/');
    } catch (error) {
      if (isApplicationError(error)) {
        next(error);
        return;
      }

      next(makeInternalErrorHandler('Unexpected error handling the OIDC callback')(error));
    }
  };
}

export default makeCallbackHandler;
