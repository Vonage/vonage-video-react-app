import axios from 'axios';
import tryCatch from '@common/execution/tryCatch';
import type { EnabledAuthConfig } from '../../../middleware/authMiddleware/schemas/AuthConfig.schema';

type TokenToRevoke = {
  token: string | undefined;
  tokenTypeHint: 'access_token' | 'refresh_token';
};

/**
 * RFC 7009 revocation. Best effort: a provider failure never stops a sign-out.
 */
async function revokeTokens({
  tokens,
  authConfig: { oidcRevocationEndpoint, oidcClientId, authProviderTimeoutMs },
}: {
  tokens: TokenToRevoke[];
  authConfig: EnabledAuthConfig;
}): Promise<void> {
  const presentTokens = tokens.filter(
    (entry): entry is { token: string; tokenTypeHint: TokenToRevoke['tokenTypeHint'] } =>
      !!entry.token
  );

  await Promise.all(
    presentTokens.map(({ token, tokenTypeHint }) =>
      tryCatch(() =>
        axios.post(
          oidcRevocationEndpoint,
          new URLSearchParams({ token, token_type_hint: tokenTypeHint, client_id: oidcClientId }),
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: authProviderTimeoutMs,
          }
        )
      )
    )
  );
}

export default revokeTokens;
