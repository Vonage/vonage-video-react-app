import { createContext, ReactNode, useMemo } from 'react';
import useConfig, { defaultConfig } from './useConfig';

export type ConfigProviderProps = {
  children: ReactNode;
};

export type ConfigContextType = ReturnType<typeof useConfig>;

export const ConfigContext = createContext<ConfigContextType>({
  audioSettings: defaultConfig.audioSettings,
  meetingRoomSettings: defaultConfig.meetingRoomSettings,
  waitingRoomSettings: defaultConfig.waitingRoomSettings,
  videoSettings: defaultConfig.videoSettings,
});

/**
 * ConfigProvider - React Context Provider for ConfigContext
 * ConfigContext contains all application configuration including video settings, audio settings,
 * waiting room settings, and meeting room settings loaded from config.json.
 * We use Context to make the configuration available in many components across the app without
 * prop drilling: https://react.dev/learn/passing-data-deeply-with-context#use-cases-for-context
 * See useConfig.tsx for configuration structure and loading logic
 * @param {ConfigProviderProps} props - The provider properties
 *  @property {ReactNode} children - The content to be rendered
 * @returns {ConfigContext} a context provider for application configuration
 */
export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const config = useConfig();
  const value = useMemo(() => config, [config]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};
