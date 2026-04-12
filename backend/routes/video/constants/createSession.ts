import type { HandlersConfig } from '@api-lib';
import { MediaMode } from '@vonage/video';

const createSession: HandlersConfig['createSession'] = {
  defaults: (payload) => ({
    ...payload,
    sessionOptions: {
      mediaMode: MediaMode.ROUTED,
      ...payload?.sessionOptions,
    },
  }),
};

export default createSession;
