import { createContext, PropsWithChildren, ReactNode } from 'react';
import useConfig from './useConfig';
import type AppConfigStore from './AppConfigStore';

type ConfigProviderProps = PropsWithChildren<{
  value: AppConfigStore;
}>;

export const ConfigContext = createContext<AppConfigStore | null>(null);

export const ConfigProviderBase = ({ children, value }: ConfigProviderProps) => {
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

/**
 * ConfigProvider - React Context Provider for ConfigContext
 * ConfigContext contains all application configuration including video settings, audio settings,
 * waiting room settings, and meeting room settings loaded from config.json.
 * We use Context to make the configuration available in many components across the app without
 * prop drilling: https://react.dev/learn/passing-data-deeply-with-context#use-cases-for-context
 * See useConfig.tsx for configuration structure and loading logic
 * @param {ConfigProviderProps} props - The provider properties
 * @property {ReactNode} children - The content to be rendered
 * @returns {ConfigContext} a context provider for application configuration
 */
const ConfigProvider = ({ children }: Omit<ConfigProviderProps, 'value'>) => {
  const value = useConfig();

  return <ConfigProviderBase value={value}>{children}</ConfigProviderBase>;
};

export default ConfigProvider;
