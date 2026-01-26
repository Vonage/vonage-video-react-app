import devices$ from '../DevicesStore';

const useAudioOutput = devices$.createSelectorHook((state) => state.audioOutput);

export default useAudioOutput;
