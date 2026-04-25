import runtime$ from '@core/stores/runtime';
import RuntimeProvider from '@core/stores/runtime/RuntimeProvider';
import { makeGenericProviderWrapper } from '@web-test';
import type { GenericWrapperOptions } from '@web-test/makeGenericProviderWrapper';

export type RuntimeProviderWrapperOptions = GenericWrapperOptions<
  typeof RuntimeProvider,
  typeof runtime$.Context
>;

function makeRuntimeProviderWrapper(
  options: RuntimeProviderWrapperOptions = { videoClient: null! }
) {
  const [wrapper, context] = makeGenericProviderWrapper(RuntimeProvider, runtime$.Context, options);

  return { wrapper, context };
}

export default makeRuntimeProviderWrapper;
