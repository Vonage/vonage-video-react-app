import makeUseStoreContext from '@Context/helpers/makeUseStoreContext';
import { useContext } from 'react';
import { defaultConfig } from '@Context/ConfigProvider/useConfig';
import { ConfigContext, ConfigContextType } from '../Context/ConfigProvider';

const useStoreContext = makeUseStoreContext(ConfigContext);

/**
 * Custom hook to access the Config context containing comprehensive application configuration settings.
 * Provides access to video settings (background effects, camera control, resolution), audio settings
 * (noise suppression, microphone control), waiting room settings (device selection), and meeting room
 * settings (layout mode, UI button visibility). Configuration is loaded from config.json and merged
 * with default values via the useConfig hook.
 * @returns {ConfigContextType} The config context value with all application settings
 */
const useConfigContext = (): ConfigContextType => {
  const store = useContext(ConfigContext);
  if (!store) {
    return {
      ...defaultConfig,
      isLoaded: false,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useStoreContext(
    ({ videoSettings, audioSettings, waitingRoomSettings, meetingRoomSettings }) => ({
      videoSettings,
      audioSettings,
      waitingRoomSettings,
      meetingRoomSettings,
    })
  ) as ConfigContextType;
};

export default useConfigContext;
