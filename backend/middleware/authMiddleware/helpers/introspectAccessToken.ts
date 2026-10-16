import axios from 'axios';
import { makeThirdPartyErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import tryCatch from '@common/execution/tryCatch';
import type { EnabledAuthConfig } from '../schemas/AuthConfig.schema';
import TokenIntrospectionResponseSchema, {
  type TokenIntrospectionResponse,
} from '../schemas/TokenIntrospectionResponse.schema';
import makeProviderResponseError from './makeProviderResponseError';

/**
 * Provider failures throw a 502, never a 401 or a SignInRequiredError: the frontend sends every 401
 * to sign-in, so an outage would otherwise become a sign-in loop.
 */
async function introspectAccessToken({
  accessToken,
  authConfig: { oidcIntrospectionEndpoint, oidcClientId, authProviderTimeoutMs },
}: {
  accessToken: string;
  authConfig: EnabledAuthConfig;
}): Promise<TokenIntrospectionResponse> {
  const handleProviderFailure = makeThirdPartyErrorHandler(
    'Token introspection request to the identity provider failed'
  );

  const { result: introspectionResponse, error } = await tryCatch(() =>
    axios.post(
      oidcIntrospectionEndpoint,
      new URLSearchParams({
        token: accessToken,
        client_id: oidcClientId,
        token_type_hint: 'access_token',
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: authProviderTimeoutMs,
        validateStatus: () => true,
      }
    )
  );

  if (error || !introspectionResponse) throw handleProviderFailure(error);

  if (introspectionResponse.status !== 200) {
    throw handleProviderFailure(
      makeProviderResponseError({
        endpoint: oidcIntrospectionEndpoint,
        response: introspectionResponse,
      })
    );
  }

  return assertResult(
    () => TokenIntrospectionResponseSchema.parse(introspectionResponse.data),
    makeThirdPartyErrorHandler('Token introspection response is missing or invalid')
  );
}

export default introspectAccessToken;
