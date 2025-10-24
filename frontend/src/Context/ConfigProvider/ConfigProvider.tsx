import { createContext, PropsWithChildren } from 'react';
import useConfig from './useConfig';
import type AppConfigStore from './AppConfigStore';

type ConfigProviderProps = PropsWithChildren;

export const ConfigContext = createContext<AppConfigStore | null>(null);

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
const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const value = useConfig();

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export default ConfigProvider;
