import createContext, { type InferContextApi } from 'react-global-state-hooks/createContext';
import updateAppConfig from './actions/updateAppConfig';
import loadAppConfig from './actions/loadAppConfig';
import initialValue from './helpers/defaultAppConfig';

/**
 * Creates the AppConfig store
 * The store includes Context, Provider, and use hook for consuming the context.
 */
const appConfig = createContext(initialValue, {
  actions: {
    updateAppConfig,
    loadAppConfig,
  },
});

/**
 * The AppConfig context type.
 * Represents the shape of the context including state and actions.
 */
export type AppConfigApi = InferContextApi<typeof appConfig.Context>;

export default appConfig;
