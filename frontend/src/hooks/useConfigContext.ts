import makeUseStoreContext from '@Context/helpers/makeUseStoreContext';
import { ConfigContext, ConfigContextType, AppConfig } from '../Context/ConfigProvider';

const useStoreContext = makeUseStoreContext(ConfigContext);

/**
 * Custom hook to access the Config context containing comprehensive application configuration settings.
 * Provides access to video settings (background effects, camera control, resolution), audio settings
 * (noise suppression, microphone control), waiting room settings (device selection), and meeting room
 * settings (layout mode, UI button visibility). Configuration is loaded from config.json and merged
 * with default values via the useConfig hook.
 * @returns {AppConfig} The config context value with all application settings
 */
const useConfigContext = () => {
  return useStoreContext().getSnapshot();
};

export default useConfigContext;
