import type { PropsWithChildren } from 'react';
import advancedSettingsDialog$ from '@Context/AdvancedSettingsDialog';
import type { AdvancedSettingsDialogState } from '@Context/AdvancedSettingsDialog';

export type AdvancedSettingsProviderWrapperOptions = {
  dialogState?: Partial<AdvancedSettingsDialogState>;
};

function makeAdvancedSettingsProviderWrapper(options: AdvancedSettingsProviderWrapperOptions = {}) {
  const { dialogState = {} } = options;

  const wrapper = ({ children }: PropsWithChildren) => (
    <advancedSettingsDialog$.Provider value={(initial) => ({ ...initial, ...dialogState })}>
      {children}
    </advancedSettingsDialog$.Provider>
  );

  return { wrapper, context: undefined };
}

export default makeAdvancedSettingsProviderWrapper;
