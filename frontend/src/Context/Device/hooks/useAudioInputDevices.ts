import isAudioInputDevice from '@utils/isAudioInputDevice';
import devices$ from '../DevicesContext';

const useAudioInputDevices = devices$.createSelectorHook((state) =>
  state.devices.filter(isAudioInputDevice)
);

export default useAudioInputDevices;
