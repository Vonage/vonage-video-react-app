import { getAudioSourceDeviceId } from '@utils/util';
import mediaDevices$ from '@core/stores/devices';
import { Publisher } from '@vonage/client-sdk-video';

const isAudioInputDevice = (device: MediaDeviceInfo): boolean =>
  device.kind.toLowerCase() === 'audioinput';

function getDeviceId(publisher: Publisher | null, kind: MediaDeviceKind): string | null {
  if (!publisher) return null;

  if (kind === 'videoinput') {
    const source = publisher.getVideoSource();
    return source?.deviceId ?? null;
  }

  if (kind === 'audioinput') {
    // [TODO]: check why audio needs to lookup differently than video, legacy setMediaDevices, mediaDeviceUtils.ts
    const source = publisher.getAudioSource();
    const audioInputDevices = mediaDevices$.getState().mediaDeviceInfo.filter(isAudioInputDevice);
    return getAudioSourceDeviceId(audioInputDevices, source);
  }

  return null;
}

export default getDeviceId;
