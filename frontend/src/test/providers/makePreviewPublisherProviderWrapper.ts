import {
  PreviewPublisherProvider,
  PreviewPublisherContext,
} from '@Context/PreviewPublisherProvider';
import composeProviders from '@common/helpers/composeProviders';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@common/test/makeGenericProviderWrapper';
import makeUserProviderWrapper from './makeUserProviderWrapper';
import makeAppConfigProviderWrapper, {
  AppConfigProviderWrapperOptions,
} from './makeAppConfigProviderWrapper';

export type PreviewPublisherProviderWrapperOptions = {
  previewPublisherOptions?: GenericWrapperOptions<
    typeof PreviewPublisherProvider,
    typeof PreviewPublisherContext
  >;
  appConfigOptions?: AppConfigProviderWrapperOptions;
  /**
   * If true, skips creating AppConfig and User providers (useful when they're already provided at a higher level).
   * Defaults to false for backward compatibility when used standalone.
   */
  skipAppConfigAndUser?: boolean;
};

/**
 * Creates wrapper for the PreviewPublisherProvider context.
 * Allows accessing the context value for testing.
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.previewPublisherOptions] - Options for the PreviewPublisherProvider wrapper.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper (only used if skipAppConfigAndUser is false).
 * @param {boolean} [options.skipAppConfigAndUser] - If true, skips creating AppConfig and User providers.
 * @returns The PreviewPublisherProvider wrapper and context getter.
 */
function makePreviewPublisherProviderWrapper({
  previewPublisherOptions,
  appConfigOptions,
  skipAppConfigAndUser = false,
}: PreviewPublisherProviderWrapperOptions = {}) {
  const [PreviewPublisherProviderWrapper, previewPublisherContext] = makeGenericProviderWrapper(
    PreviewPublisherProvider,
    PreviewPublisherContext,
    previewPublisherOptions
  );

  // Only create AppConfig and User providers if not skipped (for standalone usage)
  if (skipAppConfigAndUser) {
    return {
      previewPublisherContext,
      PreviewPublisherProviderWrapper,
    };
  }

  const { UserProviderWrapper, ...user } = makeUserProviderWrapper();
  const { AppConfigWrapper, ...appConfigContext } = makeAppConfigProviderWrapper(appConfigOptions);

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
