import type { Device } from '@vonage/client-sdk-video';
import devicesStore from '../devicesStore';

const isVideoInputDevice = (device: Device): boolean => device.kind.toLowerCase() === 'videoinput';

const useVideoInputDevices = devicesStore.createSelectorHook((state) =>
  state.devices.filter(isVideoInputDevice)
);

export default useVideoInputDevices;
