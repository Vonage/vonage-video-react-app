import serverSettings$ from '@core/stores/serverSettings';

export type ServerSettingsProviderWrapperOptions = Parameters<
  typeof serverSettings$.Provider.makeProviderWrapper
>[0];

function makeServerSettingsProviderWrapper(options: ServerSettingsProviderWrapperOptions = {}) {
  return serverSettings$.Provider.makeProviderWrapper(options);
}

export default makeServerSettingsProviderWrapper;
