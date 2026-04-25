import runtime$ from '@core/stores/runtime';
import RuntimeProvider from '@core/stores/runtime/RuntimeProvider';
import { makeGenericProviderWrapper } from '@web-test';
import type { GenericWrapperOptions } from '@web-test/makeGenericProviderWrapper';
import type { VideoClient } from '@core/services';

export type RuntimeProviderWrapperOptions = Omit<
  GenericWrapperOptions<typeof RuntimeProvider, typeof runtime$.Context>,
  'videoClient'
> & {
  videoClient?: VideoClient | null;
};

function makeRuntimeProviderWrapper(options: RuntimeProviderWrapperOptions = {}) {
  const [wrapper, context] = makeGenericProviderWrapper(RuntimeProvider, runtime$.Context, {
    videoClient: null!,
    ...options,
  } as Parameters<typeof RuntimeProvider>[0]);

  return { wrapper, context };
}

export default makeRuntimeProviderWrapper;
