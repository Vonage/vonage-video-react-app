import {
  PreviewPublisherProvider,
  PreviewPublisherContext,
} from '@Context/PreviewPublisherProvider';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@web-test/makeGenericProviderWrapper';

export type PreviewPublisherProviderWrapperOptions = GenericWrapperOptions<
  typeof PreviewPublisherProvider,
  typeof PreviewPublisherContext
>;

/**
 * Creates wrapper for the PreviewPublisherProvider context.
 * Allows overriding context values via options and accessing the context value.
 * @param {object} options - The wrapper options.
 * @returns The PreviewPublisherProvider wrapper and context getter.
 */
function makePreviewPublisherProviderWrapper(options: PreviewPublisherProviderWrapperOptions = {}) {
  const [wrapper, context] = makeGenericProviderWrapper(
    PreviewPublisherProvider,
    PreviewPublisherContext,
    options
  );

  return {
    wrapper,
    context,
  };
}

export default makePreviewPublisherProviderWrapper;
