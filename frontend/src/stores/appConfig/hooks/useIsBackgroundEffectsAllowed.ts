import appConfig$ from '../AppConfigStore';

const useIsBackgroundEffectsAllowed = appConfig$.use.createSelectorHook(
  ({ isAppConfigLoaded, videoSettings }) =>
    isAppConfigLoaded && videoSettings.allowBackgroundEffects
);

export default useIsBackgroundEffectsAllowed;
