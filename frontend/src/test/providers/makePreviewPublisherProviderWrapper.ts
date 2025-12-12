import {
  PreviewPublisherProvider,
  PreviewPublisherContext,
} from '@Context/PreviewPublisherProvider';
import makeGenericProviderWrapper, { GenericWrapperOptions } from './makeGenericProviderWrapper';

export type PreviewPublisherProviderWrapperOptions = GenericWrapperOptions<
  typeof PreviewPublisherProvider,
  typeof PreviewPublisherContext
>;

/**
 * Creates wrapper for the PreviewPublisherProvider context.
 * Allows accessing the context value for testing.
 * @param options - The wrapper options.
 * @returns The PreviewPublisherProvider wrapper and context getter.
 */
function makePreviewPublisherProviderWrapper(options?: PreviewPublisherProviderWrapperOptions) {
  const [PreviewPublisherProviderWrapper, previewPublisherContext] = makeGenericProviderWrapper(
    PreviewPublisherProvider,
    PreviewPublisherContext,
    options
  );

  return { PreviewPublisherProviderWrapper, previewPublisherContext };
}

export default makePreviewPublisherProviderWrapper;
