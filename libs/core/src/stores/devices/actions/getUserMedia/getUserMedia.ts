import type { DevicesAPI } from '../../types';

function getUserMedia(this: DevicesAPI['actions'], constraints: MediaStreamConstraints) {
  return (_: DevicesAPI): Promise<MediaStream> => {
    return navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      // After successfully getting user media, sync the media devices info
      void this.syncMediaDevicesInfo();
      return stream;
    });
  };
}

export default getUserMedia;
