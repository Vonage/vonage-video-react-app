import devices$ from '../DevicesContext';

const useAudioOutputDevices = devices$.createSelectorHook((state) => state.audioOutputDevices);

export default useAudioOutputDevices;
