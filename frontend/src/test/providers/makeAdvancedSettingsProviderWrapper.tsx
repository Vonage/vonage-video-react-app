import type { PropsWithChildren } from 'react';
import advancedSettings$ from '@Context/AdvancedSettings';
import type { AdvancedSettingsDialogState } from '@Context/AdvancedSettings';

export type AdvancedSettingsProviderWrapperOptions = {
  dialogState?: Partial<AdvancedSettingsDialogState>;
};

function makeAdvancedSettingsProviderWrapper(options: AdvancedSettingsProviderWrapperOptions = {}) {
  const { dialogState = {} } = options;

  const wrapper = ({ children }: PropsWithChildren) => (
    <advancedSettings$.Provider value={(initial) => ({ ...initial, ...dialogState })}>
      {children}
    </advancedSettings$.Provider>
  );

  return { wrapper, context: undefined };
}

export default makeAdvancedSettingsProviderWrapper;
