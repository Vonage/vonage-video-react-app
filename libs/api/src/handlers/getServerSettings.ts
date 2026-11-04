import type { IVideoClient } from '@api-lib/types';

function getServerSettings(this: IVideoClient) {
  return { serverTime: Date.now() };
}

export default getServerSettings;
