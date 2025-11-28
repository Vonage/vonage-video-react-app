import appConfig from '../AppConfigContext';

const useIsBackgroundEffectsAllowed = appConfig.use.createSelectorHook(
  ({ isAppConfigLoaded, videoSettings }) =>
    isAppConfigLoaded && videoSettings.allowBackgroundEffects
);

export default useIsBackgroundEffectsAllowed;
