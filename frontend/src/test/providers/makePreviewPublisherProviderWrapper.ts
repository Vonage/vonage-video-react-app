import {
  PreviewPublisherProvider,
  PreviewPublisherContext,
} from '@Context/PreviewPublisherProvider';
import makeGenericProviderWrapper, { GenericWrapperOptions } from './makeGenericProviderWrapper';

export type PreviewPublisherProviderWrapperOptions = {
  previewPublisherOptions?: GenericWrapperOptions<
    typeof PreviewPublisherProvider,
    typeof PreviewPublisherContext
  >;
};

/**
 * Creates wrapper for the PreviewPublisherProvider context.
 * Allows accessing the context value for testing.
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.previewPublisherOptions] - Options for the PreviewPublisherProvider wrapper.
 * @returns The PreviewPublisherProvider wrapper and context getter.
 */
function makePreviewPublisherProviderWrapper({
  previewPublisherOptions,
}: PreviewPublisherProviderWrapperOptions = {}) {
  const [PreviewPublisherProviderWrapper, previewPublisherContext] = makeGenericProviderWrapper(
    PreviewPublisherProvider,
    PreviewPublisherContext,
    previewPublisherOptions
  );

  return { PreviewPublisherProviderWrapper, previewPublisherContext };
}

export default makePreviewPublisherProviderWrapper;
