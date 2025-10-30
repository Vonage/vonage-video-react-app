import { useAppConfigContext } from './AppConfigContext';

export {
  type AppConfigContextType,
  AppConfigContext,
  AppConfigProvider,
  useAppConfigContext,
  useAppConfigControls,
} from './AppConfigContext';

export type { AppConfig } from './AppConfigContext.types';

export { default as defaultAppConfig } from './helpers/defaultAppConfig';
export { default as mergeAppConfigs } from './helpers/mergeAppConfigs';

export default useAppConfigContext;
