import { describe, it, expect } from 'vitest';
import { StrictMode } from 'react';
import appConfig$ from '../..';
import { AppConfigProviderWrapperOptions, makeAppConfigProviderWrapper } from '@test/providers';
import composeProviders from '@common/helpers/composeProviders';
import SuspenseBoundary from '@common/components/SuspenseBoundary';
import renderAsyncHook from '@test-helpers/renderAsyncHook';

describe('useSuspenseUntilAppConfigReady', () => {
  it('should not trigger duplicate subscriptions in strict mode', async () => {
    const { result } = await renderHook(
      () => {
        appConfig$.useSuspenseUntilAppConfigReady();

        return appConfig$.use.select((state) => state.isAppConfigLoaded);
      },
      {
        appConfigOptions: {
          value: {
            isAppConfigLoaded: false,
          },
        },
      }
    );

    expect(result.current).toBe(null);
  });
});

async function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  options?: {
    appConfigOptions?: AppConfigProviderWrapperOptions;
  }
) {
  const { appConfigContext, AppConfigWrapper } = makeAppConfigProviderWrapper(
    options?.appConfigOptions
  );

  const wrapper = composeProviders(StrictMode, SuspenseBoundary, AppConfigWrapper);
  const result = await renderAsyncHook(render, { wrapper });

  return {
    ...result,
    appConfigContext,
  };
}
