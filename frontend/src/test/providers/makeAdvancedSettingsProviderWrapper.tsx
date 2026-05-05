import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import advancedSettings$ from '@Context/AdvancedSettings';
import type { advancedSettings } from '@Context/AdvancedSettings';

export type AdvancedSettingsProviderWrapperOptions = {
  dialogState?: Partial<advancedSettings>;
};

function makeAdvancedSettingsProviderWrapper(options: AdvancedSettingsProviderWrapperOptions = {}) {
  const { dialogState = {} } = options;
  const previousState = advancedSettings$.getState();

  if (Object.keys(dialogState).length > 0) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  const Wrapper = ({ children }: PropsWithChildren) => {
    useEffect(() => {
      return () => {
        advancedSettings$.setState(previousState);
      };
    }, []);

    return children;
  };

  return { wrapper: Wrapper, context: undefined };
}

export default makeAdvancedSettingsProviderWrapper;
