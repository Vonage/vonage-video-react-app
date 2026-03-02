import { PublisherProvider, PublisherContext } from '@Context/PublisherProvider';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@web-test/makeGenericProviderWrapper';

export type PublisherProviderWrapperOptions = GenericWrapperOptions<
  typeof PublisherProvider,
  typeof PublisherContext
>;

/**
 * Creates wrapper for the PublisherProvider context.
 * Allows overriding context values via options and accessing the context value.
 * @param {object} options - The wrapper options.
 * @returns {object} The PublisherProvider wrapper and context getter.
 */
function makePublisherProviderWrapper(options: PublisherProviderWrapperOptions = {}) {
  const [wrapper, context] = makeGenericProviderWrapper(
    PublisherProvider,
    PublisherContext,
    options
  );

  return {
    wrapper,
    context,
  };
}

export default makePublisherProviderWrapper;
