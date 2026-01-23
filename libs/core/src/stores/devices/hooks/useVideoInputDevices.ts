import type { Device } from '@vonage/client-sdk-video';
import devices$ from '../DevicesStore';

const isVideoInputDevice = (device: Device): boolean => device.kind.toLowerCase() === 'videoinput';

const useVideoInputDevices = devices$.createSelectorHook((state) =>
  state.devices.filter(isVideoInputDevice)
);

export default useVideoInputDevices;
