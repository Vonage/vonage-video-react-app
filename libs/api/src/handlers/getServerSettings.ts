import type { GetServerSettingsPayload, IVideoClient } from '@api-lib/types';

function getServerSettings(this: IVideoClient, _payload?: GetServerSettingsPayload) {
  return { serverTime: Date.now(), extension: this._extension };
}

export default getServerSettings;
