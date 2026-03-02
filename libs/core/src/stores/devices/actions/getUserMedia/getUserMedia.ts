import type { DevicesAPI } from '../../types';

/**
 * Wrapper around navigator.mediaDevices.getUserMedia that also syncs the media devices info in the store after successfully getting user media.
 * This ensures that the store is always up to date with the latest media permissions and devices info, even if getUserMedia is called outside of the store's actions.
 */
function getUserMedia(this: DevicesAPI['actions'], constraints: MediaStreamConstraints) {
  return ({ getMetadata }: DevicesAPI): Promise<MediaStream> => {
    return getMetadata().__getUserMedia!(constraints).then((stream) => {
      // After successfully getting user media, sync the media devices info
      void this.syncMediaDevicesInfo();
      return stream;
    });
  };
}

export default getUserMedia;
