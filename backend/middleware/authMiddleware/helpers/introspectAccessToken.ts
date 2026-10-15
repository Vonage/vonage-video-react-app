import axios from 'axios';
import { makeThirdPartyErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import type { EnabledAuthConfig } from '../schemas/AuthConfig.schema';
import TokenIntrospectionResponseSchema, {
  type TokenIntrospectionResponse,
} from '../schemas/TokenIntrospectionResponse.schema';

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
  const introspectionResponse = await assertResult(
    () =>
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
        }
      ),
    makeThirdPartyErrorHandler('Token introspection request to the identity provider failed')
  );

  return assertResult(
    () => TokenIntrospectionResponseSchema.parse(introspectionResponse.data),
    makeThirdPartyErrorHandler('Token introspection response is missing or invalid')
  );
}

export default introspectAccessToken;
