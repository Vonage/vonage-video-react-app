import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';
import {
  makeInternalErrorHandler,
  makeNotFoundErrorHandler,
  makeThirdPartyErrorHandler,
  makeUnauthorizedErrorHandler,
} from '@api-lib/errors';
import { isApplicationError } from '@common/errors/assertions';
import tryCatch from '@common/execution/tryCatch';
import makeProviderResponseError from '../../../middleware/authMiddleware/helpers/makeProviderResponseError';
import loadConfig from '../../../helpers/config';
import readStringQueryParam from '../helpers/readStringQueryParam';
import readCookiePayload from '../helpers/readCookiePayload';
import writeSessionCookies from '../helpers/writeSessionCookies';
import buildAuthCookieOptions from '../helpers/buildAuthCookieOptions';
import readCallbackPath from '../helpers/readCallbackPath';
import TokenExchangeResponseSchema from '../schemas/TokenExchangeResponse.schema';
import AuthTransactionCookieSchema from '../schemas/AuthTransactionCookie.schema';

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

  const {
    oidcTokenEndpoint,
    oidcClientId,
    oidcWebRedirectUri,
    authCookieSecret,
    authTransactionCookieName,
    authProviderTimeoutMs,
  } = authConfig;

  const callbackPath = readCallbackPath({ oidcWebRedirectUri });

  return async function handleRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const providerError = readStringQueryParam(req.query.error);

      if (providerError) {
        throw makeUnauthorizedErrorHandler(
          `The identity provider rejected the login attempt: ${providerError}`
        )(null);
      }

      const code = readStringQueryParam(req.query.code);
      const returnedState = readStringQueryParam(req.query.state);

      if (!code || !returnedState) {
        throw makeUnauthorizedErrorHandler('Callback is missing the "code" or "state" parameter')(
          null
        );
      }

      const transaction = readCookiePayload({
        req,
        name: authTransactionCookieName,
        secret: authCookieSecret,
        schema: AuthTransactionCookieSchema,
      });

      if (!transaction) {
        throw makeUnauthorizedErrorHandler('Missing, expired or invalid auth transaction cookie')(
          null
        );
      }

      if (transaction.state !== returnedState) {
        throw makeUnauthorizedErrorHandler('State parameter does not match — possible CSRF')(null);
      }

      const handleTokenExchangeFailure = makeThirdPartyErrorHandler(
        'Token exchange with the identity provider failed'
      );

      const { result: tokenResponse, error: tokenRequestError } = await tryCatch(() =>
        axios.post(
          oidcTokenEndpoint,
          new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: oidcWebRedirectUri,
            client_id: oidcClientId,
            code_verifier: transaction.codeVerifier,
          }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: authProviderTimeoutMs,
            validateStatus: () => true,
          }
        )
      );

      if (tokenRequestError || !tokenResponse) {
        throw handleTokenExchangeFailure(tokenRequestError);
      }

      if (tokenResponse.status !== 200) {
        throw handleTokenExchangeFailure(
          makeProviderResponseError({ endpoint: oidcTokenEndpoint, response: tokenResponse })
        );
      }

      const parsedTokenResponse = TokenExchangeResponseSchema.safeParse(tokenResponse.data);

      if (!parsedTokenResponse.success) {
        throw makeUnauthorizedErrorHandler('Token exchange response failed schema validation')(
          null
        );
      }

      res.clearCookie(
        authTransactionCookieName,
        buildAuthCookieOptions({ path: callbackPath, maxAge: undefined, oidcWebRedirectUri })
      );

      writeSessionCookies({
        res,
        tokenResponse: parsedTokenResponse.data,
        previousRefreshToken: undefined,
        authConfig,
      });

      res.redirect(transaction.returnTo);
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
