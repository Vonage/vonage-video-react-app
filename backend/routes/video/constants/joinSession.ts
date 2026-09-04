import type { HandlersConfig } from '@api-lib';
import { TokenRole } from '@api-lib';

const twentyFourHoursInSeconds = 24 * 60 * 60;

const joinSession: HandlersConfig['joinSession'] = {
  transformInput: ({ input, assertInput }) => {
    const payload = assertInput(input);

    const {
      role: _ignoredRole,
      expireTime: _ignoredExpireTime,
      ...safeClientOptions
    } = payload.clientTokenOptions || {};

    return {
      ...payload,
      clientTokenOptions: {
        ...safeClientOptions,
        role: TokenRole.MODERATOR,
        expireTime: Math.floor(Date.now() / 1000) + twentyFourHoursInSeconds,
      },
    };
  },
};

export default joinSession;
