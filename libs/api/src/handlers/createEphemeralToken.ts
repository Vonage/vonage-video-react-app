import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import type { CreateEphemeralTokenPayload } from '@api-lib/schemas/CreateEphemeralTokenPayload.schema';
import { TokenRole, type IVideoClient } from '@api-lib/types';
import type { ClientTokenOptions } from '@vonage/video';

/**
 * Creates an ephemeral client token with a default 30 seconds expiration time
 * This token is meant to be used for server-to-server operations that require a token
 */
function createEphemeralToken(this: IVideoClient, payload: CreateEphemeralTokenPayload): string {
  try {
    const { sessionId, clientTokenOptions } = payload;

    const tokenOptions: ClientTokenOptions = {
      role: TokenRole.MODERATOR,

      // Chosen 30s because our K8s probes use 10s timeouts; allows one retry + margin.
      expireTime: Date.now() + 30 * 1000,

      ...clientTokenOptions,
    };

    const token = assertResult(
      () => this._video.generateClientToken(sessionId, tokenOptions),
      makeThirdPartyErrorHandler('Failed to generate client token')
    );

    return token;
  } catch (error) {
    throw makeInternalErrorHandler('Failed to create ephemeral token')(error);
  }
}

export default createEphemeralToken;
