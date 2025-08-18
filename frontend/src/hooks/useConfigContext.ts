import { useContext } from 'react';
import { ConfigContext, ConfigContextType } from '../Context/ConfigProvider';

/**
 * Custom hook to access the Config context
 * @returns {ConfigContextType} The config context value
 */
const useConfigContext = (): ConfigContextType => {
  const context = useContext(ConfigContext);

  return context;
};

export default useConfigContext;
