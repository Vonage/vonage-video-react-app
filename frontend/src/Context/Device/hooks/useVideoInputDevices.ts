import isVideoInputDevice from '@utils/isVideoInputDevice';
import devices$ from '../DevicesContext';

const useVideoInputDevices = devices$.createSelectorHook((state) =>
  state.devices.filter(isVideoInputDevice)
);

export default useVideoInputDevices;
