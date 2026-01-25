import devicesStore from '../devicesStore';

const useSelectedAudioInput = devicesStore.createSelectorHook(
  (state) => state.selectedAudioInput ?? null
);

export default useSelectedAudioInput;
