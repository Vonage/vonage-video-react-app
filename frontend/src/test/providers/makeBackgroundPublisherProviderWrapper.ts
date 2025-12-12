import {
  BackgroundPublisherProvider,
  BackgroundPublisherContext,
} from '@Context/BackgroundPublisherProvider';
import makeGenericProviderWrapper, { GenericWrapperOptions } from './makeGenericProviderWrapper';

export type BackgroundPublisherProviderWrapperOptions = GenericWrapperOptions<
  typeof BackgroundPublisherProvider,
  typeof BackgroundPublisherContext
>;

/**
 * Creates wrapper for the BackgroundPublisherProvider context.
 * Allows accessing the context value for testing.
 * @param options - The wrapper options.
 * @returns The BackgroundPublisherProvider wrapper and context getter.
 */
function makeBackgroundPublisherProviderWrapper(
  options?: BackgroundPublisherProviderWrapperOptions
) {
  const [BackgroundPublisherProviderWrapper, backgroundPublisherContext] =
    makeGenericProviderWrapper(BackgroundPublisherProvider, BackgroundPublisherContext, options);

  return { BackgroundPublisherProviderWrapper, backgroundPublisherContext };
}

export default makeBackgroundPublisherProviderWrapper;
