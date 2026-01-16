import {
  PreviewPublisherProvider,
  PreviewPublisherContext,
} from '@Context/PreviewPublisherProvider';
import composeProviders from '@utils/composeProviders';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@common/test/makeGenericProviderWrapper';
import makeUserProviderWrapper from './makeUserProviderWrapper';
import makeAppConfigProviderWrapper from './makeAppConfigProviderWrapper';

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
  const { UserProviderWrapper, ...user } = makeUserProviderWrapper();
  const { AppConfigWrapper, ...appConfigContext } = makeAppConfigProviderWrapper();

  const [PreviewPublisherProviderWrapper, previewPublisherContext] = makeGenericProviderWrapper(
    PreviewPublisherProvider,
    PreviewPublisherContext,
    previewPublisherOptions
  );

  const composeWrapper = composeProviders(
    AppConfigWrapper,
    UserProviderWrapper,
    PreviewPublisherProviderWrapper
  );

  return {
    ...user,
    ...appConfigContext,
    previewPublisherContext,
    PreviewPublisherProviderWrapper: composeWrapper,
  };
}

export default makePreviewPublisherProviderWrapper;
