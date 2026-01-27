import appConfigStore from '../appConfigStore';

const useIsBackgroundEffectsAllowed = appConfigStore.use.createSelectorHook(
  ({ isAppConfigLoaded, videoSettings }) =>
    isAppConfigLoaded && videoSettings.allowBackgroundEffects
);

export default useIsBackgroundEffectsAllowed;
