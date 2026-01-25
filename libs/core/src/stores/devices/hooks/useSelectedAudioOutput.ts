import devicesStore from '../devicesStore';

const useSelectedAudioOutput = devicesStore.createSelectorHook(
  (state) => state.selectedAudioOutput
);

export default useSelectedAudioOutput;
