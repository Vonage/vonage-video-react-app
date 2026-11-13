import serverSettingsStore from './serverSettingsStore';
import ServerSettingsProvider from './ServerSettingsProvider';
import useServerSettings from './hooks/useServerSettings';

export type { ServerSettingsAPI } from './serverSettingsStore';

const serverSettings$ = {
  ...serverSettingsStore,
  Provider: ServerSettingsProvider,
  useServerSettings,
  useServerTimeStatus: serverSettingsStore.use.createSelectorHook((state) => state.status),
};

export default serverSettings$;
