import devicesStore from '../devicesStore';

const useSelectedVideoInput = devicesStore.createSelectorHook(
  (state) => state.selectedVideoInput ?? null
);

export default useSelectedVideoInput;
