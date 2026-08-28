import type { HandlersConfig } from '@api-lib';
import { TokenRole } from '@api-lib';

const threeHoursInSeconds = 3 * 60 * 60;

const joinSession: HandlersConfig['joinSession'] = {
  addDefaults: (payload) => ({
    ...payload,
    clientTokenOptions: {
      role: TokenRole.MODERATOR,
      // expireTime is an absolute UNIX time in seconds (the SDK writes it into the JWT `exp`).
      expireTime: Math.floor(Date.now() / 1000) + threeHoursInSeconds,
      ...payload.clientTokenOptions,
    },
  }),
};

export default joinSession;
