import type { Device } from '@vonage/client-sdk-video';
import devices$ from '../DevicesContext';

const isAudioInputDevice = (device: Device): boolean => device.kind.toLowerCase() === 'audioinput';

const useAudioInputDevices = devices$.createSelectorHook((state) =>
  state.devices.filter(isAudioInputDevice)
);

export default useAudioInputDevices;
