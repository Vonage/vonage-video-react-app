import { PublisherProvider, PublisherContext } from '@Context/PublisherProvider';
import makeGenericProviderWrapper, { GenericWrapperOptions } from './makeGenericProviderWrapper';

export type PublisherProviderWrapperOptions = GenericWrapperOptions<
  typeof PublisherProvider,
  typeof PublisherContext
>;

/**
 * Creates wrapper for the PublisherProvider context.
 * Allows accessing the context value for testing.
 * @param options - The wrapper options.
 * @returns The PublisherProvider wrapper and context getter.
 */
function makePublisherProviderWrapper(options?: PublisherProviderWrapperOptions) {
  const [PublisherProviderWrapper, publisherContext] = makeGenericProviderWrapper(
    PublisherProvider,
    PublisherContext,
    options
  );

  return { PublisherProviderWrapper, publisherContext };
}

export default makePublisherProviderWrapper;
