import {
  BackgroundPublisherProvider,
  BackgroundPublisherContext,
} from '@Context/BackgroundPublisherProvider';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@web-test/makeGenericProviderWrapper';

export type BackgroundPublisherProviderWrapperOptions = GenericWrapperOptions<
  typeof BackgroundPublisherProvider,
  typeof BackgroundPublisherContext
>;

/**
 * Creates wrapper for the BackgroundPublisherProvider context.
 * Allows overriding context values via options and accessing the context value.
 * @param {object} options - The wrapper options.
 * @returns The BackgroundPublisherProvider wrapper and context getter.
 */
function makeBackgroundPublisherProviderWrapper(
  options: BackgroundPublisherProviderWrapperOptions = {}
) {
  const [wrapper, context] = makeGenericProviderWrapper(
    BackgroundPublisherProvider,
    BackgroundPublisherContext,
    options
  );

  return {
    wrapper,
    context,
  };
}

export default makeBackgroundPublisherProviderWrapper;
