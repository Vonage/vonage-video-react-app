import axios from 'axios';
import { makeUnauthorizedErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import type { EnabledAuthConfig } from '../schemas/AuthConfig.schema';
import TokenIntrospectionResponseSchema, {
  type TokenIntrospectionResponse,
} from '../schemas/TokenIntrospectionResponse.schema';

/**
 * Provider failures throw a plain 401 (never a SignInRequiredError), so an outage can't trigger
 * a sign-in redirect loop.
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
    makeUnauthorizedErrorHandler('Token introspection request to the identity provider failed')
  );

  return assertResult(
    () => TokenIntrospectionResponseSchema.parse(introspectionResponse.data),
    makeUnauthorizedErrorHandler('Token introspection response is missing or invalid')
  );
}

export default introspectAccessToken;
