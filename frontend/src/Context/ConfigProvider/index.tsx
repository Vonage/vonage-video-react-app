import { createContext, ReactNode, useMemo } from 'react';
import useConfig, { defaultConfig } from './useConfig';

export type ConfigProviderProps = {
  children: ReactNode;
};

export type ConfigContextType = ReturnType<typeof useConfig>;

export const ConfigContext = createContext<ConfigContextType>({
  videoSettings: defaultConfig.videoSettings,
  layoutMode: defaultConfig.layoutMode,
  audioSettings: defaultConfig.audioSettings,
});

export const ConfigContextProvider = ({ children }: ConfigProviderProps) => {
  const config = useConfig();
  const value = useMemo(() => config, [config]);

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};
