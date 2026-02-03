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
import type { AppConfig } from '@stores/appConfig';
import type { FC, PropsWithChildren } from 'react';

export type PreviewPublisherProviderWrapperOptions = {
  previewPublisherOptions?: GenericWrapperOptions<
    typeof PreviewPublisherProvider,
    typeof PreviewPublisherContext
  >;
  appConfigOptions?: AppConfigProviderWrapperOptions;
  AppConfigWrapper?: FC<
    PropsWithChildren<{
      value?: AppConfig | ((initialValue: AppConfig) => AppConfig) | undefined;
    }>
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
  ...options
}: PreviewPublisherProviderWrapperOptions = {}) {
  const [PreviewPublisherProviderWrapper, previewPublisherContext] = makeGenericProviderWrapper(
    PreviewPublisherProvider,
    PreviewPublisherContext,
    previewPublisherOptions
  );

  const { UserProviderWrapper, ...user } = makeUserProviderWrapper();

  const { AppConfigWrapper, ...appConfigContext } = options.AppConfigWrapper
    ? { AppConfigWrapper: options.AppConfigWrapper }
    : makeAppConfigProviderWrapper(options.appConfigOptions);

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
