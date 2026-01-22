import devices$ from '../DevicesStore';

const useAudioOutputDevices = devices$.createSelectorHook((state) => state.audioOutputDevices);

export default useAudioOutputDevices;
