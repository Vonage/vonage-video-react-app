import type { DevicesAPI } from '../../types';
import { mediaDevicesEnvelop } from '@core/interceptors';

/**
 * Wrapper around navigator.mediaDevices.getUserMedia that also syncs the media devices info in the store after successfully getting user media.
 * This ensures that the store is always up to date with the latest media permissions and devices info, even if getUserMedia is called outside of the store's actions.
 */
function getUserMedia(this: DevicesAPI['actions'], constraints?: MediaStreamConstraints) {
  return (_api: DevicesAPI): Promise<MediaStream> => {
    // vanilla getUserMedia
    const _getUserMedia = mediaDevicesEnvelop.getOriginal('getUserMedia');

    return _getUserMedia(constraints)
      .then((stream) => {
        // After successfully getting user media, sync the media devices info
        void this.syncMediaDevicesInfo();
        return stream;
      })
      .catch((reason) => {
        // The sdk is expecting the non access error to have an specific type of format
        // firefox is not following the standard error format for permission denial, so we need to detect this case and throw a standardized error for the sdk to handle it properly.
        const isFirefoxPermissionDenial =
          reason.name === 'NotFoundError' &&
          reason.message.includes('The object can not be found here');

        if (isFirefoxPermissionDenial) {
          throw new DOMException('Permission denied by system', 'NotAllowedError');
        }

        throw reason;
      });
  };
}

export default getUserMedia;
