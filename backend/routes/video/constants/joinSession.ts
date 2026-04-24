import type { HandlersConfig } from '@api-lib';
import { TokenRole } from '@api-lib';

const threeHoursInMilliseconds = 3 * 60 * 60 * 1000;

const joinSession: HandlersConfig['joinSession'] = {
  addDefaults: (payload) => ({
    ...payload,
    clientTokenOptions: {
      role: TokenRole.MODERATOR,
      expireTime: Date.now() + threeHoursInMilliseconds,
      ...payload.clientTokenOptions,
    },
  }),
};

export default joinSession;
