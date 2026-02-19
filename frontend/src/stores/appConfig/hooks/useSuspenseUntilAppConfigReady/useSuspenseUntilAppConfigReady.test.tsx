import { describe, it, expect } from 'vitest';
import { StrictMode } from 'react';
import appConfig$ from '../..';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import composeProviders from '@web/helpers/composeProviders';
import SuspenseBoundary from '@web/components/SuspenseBoundary';
import renderAsyncHook from '@web-test/renderAsyncHook';

describe('useSuspenseUntilAppConfigReady', () => {
  it('should not trigger duplicate subscriptions in strict mode', async () => {
    const { result } = await renderHook(
      () => {
        appConfig$.useSuspenseUntilAppConfigReady();

        return appConfig$.use.select((state) => state.isAppConfigLoaded);
      },
      {
        appConfigContext: {
          value: {
            isAppConfigLoaded: false,
          },
        },
      }
    );

    expect(result.current).toBe(null);
  });
});

type RenderOptions = {
  appConfigContext?: ProviderOptions['AppConfigContext'];
};

async function renderHook<Result, Props>(
  render: (initialProps: Props) => Result,
  { appConfigContext }: RenderOptions = {}
) {
  const { wrapper: MainWrapper, ...context } = makeTestProvider([providers.appConfig], {
    appConfigContext,
  });

  const wrapper = composeProviders(StrictMode, SuspenseBoundary, MainWrapper);
  const result = await renderAsyncHook(render, { wrapper });

  return {
    ...context,
    ...result,
  };
}
