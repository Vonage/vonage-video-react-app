import axios from 'axios';
import { makeThirdPartyErrorHandler } from '@api-lib/errors';
import { isRecord } from '@common/assertions';
import tryCatch from '@common/execution/tryCatch';
import type { EnabledAuthConfig } from '../schemas/AuthConfig.schema';
import TokenExchangeResponseSchema, {
  type TokenExchangeResponse,
} from '../../../routes/auth/schemas/TokenExchangeResponse.schema';

export type RefreshOutcome =
  | { status: 'refreshed'; tokenResponse: TokenExchangeResponse }
  | { status: 'rejected' };

/**
 * `rejected` means the provider refused the refresh token (RFC 6749 §5.2 `invalid_grant`): expired,
 * revoked, or already rotated by a parallel request. Network errors and other responses throw.
 */
async function refreshAccessToken({
  refreshToken,
  authConfig: { oidcTokenEndpoint, oidcClientId, authProviderTimeoutMs },
}: {
  refreshToken: string;
  authConfig: EnabledAuthConfig;
}): Promise<RefreshOutcome> {
  const { result: response, error } = await tryCatch(() =>
    axios.post(
      oidcTokenEndpoint,
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: oidcClientId,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: authProviderTimeoutMs,
        validateStatus: () => true,
      }
    )
  );

  if (error || !response) {
    throw makeThirdPartyErrorHandler('Token refresh request to the identity provider failed')(
      error
    );
  }

  const isRefreshTokenRejected =
    response.status === 400 && isRecord(response.data) && response.data.error === 'invalid_grant';

  if (isRefreshTokenRejected) return { status: 'rejected' };

  const parsedTokenResponse = TokenExchangeResponseSchema.safeParse(response.data);

  if (response.status !== 200 || !parsedTokenResponse.success) {
    throw makeThirdPartyErrorHandler('Token refresh with the identity provider failed')(
      new Error(`Token endpoint responded with status ${response.status}`)
    );
  }

  return { status: 'refreshed', tokenResponse: parsedTokenResponse.data };
}

export default refreshAccessToken;
