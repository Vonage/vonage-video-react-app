import devicesStore from '../devicesStore';

const useAudioOutput = devicesStore.createSelectorHook((state) => state.audioOutput);

export default useAudioOutput;
