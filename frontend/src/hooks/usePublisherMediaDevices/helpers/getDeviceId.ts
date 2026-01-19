import { getAudioSourceDeviceId } from '@utils/util';
import { devices$, type DeviceKind } from '@core/stores/devices';
import { Publisher, Device } from '@vonage/client-sdk-video';

const isAudioInputDevice = (device: Device): boolean => device.kind.toLowerCase() === 'audioinput';

function getDeviceId(publisher: Publisher | null, kind: DeviceKind): string | null {
  if (!publisher) return null;

  if (kind === 'videoinput') {
    const source = publisher.getVideoSource();
    return source?.deviceId ?? null;
  }

  if (kind === 'audioinput') {
    // [TODO]: check why audio needs to lookup differently than video, legacy setMediaDevices, mediaDeviceUtils.ts
    const source = publisher.getAudioSource();
    const audioInputDevices = devices$.getState().devices.filter(isAudioInputDevice);
    return getAudioSourceDeviceId(audioInputDevices, source);
  }

  return null;
}

export default getDeviceId;
