import { makeInternalErrorHandler, makeThirdPartyErrorHandler } from '@api-lib/errors';
import { assertResult } from '@api-lib/executions';
import type { CreateEphemeralTokenPayload } from '@api-lib/schemas/CreateEphemeralTokenPayload.schema';
import { TokenRole, type IVideoClient } from '@api-lib/types';
import assertScheduleOpen from '@api-lib/schedule/assertScheduleOpen';
import { isNil, isNotNil } from '@common/assertions';
import { getScheduleWindow } from '@common/helpers';
import type { ClientTokenOptions } from '@vonage/video';

/**
 * Creates an ephemeral client token with a default 30 seconds expiration time
 * This token is meant to be used for server-to-server operations that require a token
 *
 * By default EphemeralToken use MODERATOR role and a 30s expiration time, but these can be overridden via the payload,
 * with the expiration capped at the scheduled end for scheduled keys
 */
function createEphemeralToken(this: IVideoClient, payload: CreateEphemeralTokenPayload): string {
  try {
    const { sessionKey, clientTokenOptions } = payload;
    const session = this.decodeSessionKey({ sessionKey });
    const scheduleWindow = getScheduleWindow(session);

    if (isNotNil(scheduleWindow)) assertScheduleOpen(scheduleWindow);

    const tokenOptions: ClientTokenOptions = {
      role: TokenRole.MODERATOR,

      // expireTime is an absolute UNIX time in seconds (the SDK writes it into the JWT `exp`).
      // Chosen 30s because our K8s probes use 10s timeouts; allows one retry + margin.
      expireTime: Math.floor(Date.now() / 1000) + 30,

      ...clientTokenOptions,
    };

    const expireTime = (() => {
      if (isNil(scheduleWindow)) return tokenOptions.expireTime;

      const scheduleEndInSeconds = Math.floor(scheduleWindow.endsAt / 1000);

      return Math.min(tokenOptions.expireTime ?? scheduleEndInSeconds, scheduleEndInSeconds);
    })();

    const token = assertResult(
      () => this.video.generateClientToken(session.sessionId, { ...tokenOptions, expireTime }),
      makeThirdPartyErrorHandler('Failed to generate client token')
    );

    return token;
  } catch (error) {
    throw makeInternalErrorHandler('Failed to create ephemeral token')(error);
  }
}

export default createEphemeralToken;
