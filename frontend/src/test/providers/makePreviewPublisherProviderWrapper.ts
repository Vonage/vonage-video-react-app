import {
  PreviewPublisherProvider,
  PreviewPublisherContext,
} from '@Context/PreviewPublisherProvider';
import composeProviders from '@common/helpers/composeProviders';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@common-test/makeGenericProviderWrapper';
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
  appConfigOptions?: AppConfigProviderWrapperOptions['appConfigOptions'];
  userOptions?: import('./makeUserProviderWrapper').UserProviderWrapperOptions['userOptions'];
  AppConfigWrapper?: FC<
    PropsWithChildren<{
      value?: AppConfig | ((initialValue: AppConfig) => AppConfig) | undefined;
    }>
  >;
  UserProviderWrapper?: FC<PropsWithChildren>;
};

/**
 * Creates wrapper for the PreviewPublisherProvider context.
 * The wrapper includes:
 * - AppConfigProvider: you can override its options via appConfigOptions or pass a pre-made AppConfigWrapper
 * - UserProvider: you can override its options via userOptions or pass a pre-made UserProviderWrapper
 * - PreviewPublisherProvider: you can override its options via previewPublisherOptions
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.previewPublisherOptions] - Options for the PreviewPublisherProvider wrapper.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper.
 * @param {UserProviderWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper.
 * @param {FC} [options.AppConfigWrapper] - Pre-made AppConfigWrapper to avoid re-creating it.
 * @param {FC} [options.UserProviderWrapper] - Pre-made UserProviderWrapper to avoid re-creating it.
 * @returns The PreviewPublisherProvider wrapper (both base and composed), and context getters.
 */
function makePreviewPublisherProviderWrapper({
  previewPublisherOptions,
  appConfigOptions,
  userOptions,
  ...options
}: PreviewPublisherProviderWrapperOptions = {}) {
  const [BasePreviewPublisherProviderWrapper, previewPublisherContext] = makeGenericProviderWrapper(
    PreviewPublisherProvider,
    PreviewPublisherContext,
    previewPublisherOptions
  );

  const { UserProviderWrapper, ...userProvider } = options.UserProviderWrapper
    ? {
        UserProviderWrapper: options.UserProviderWrapper,
        BaseUserProviderWrapper: options.UserProviderWrapper,
        userContext: { current: null! },
      }
    : makeUserProviderWrapper({ userOptions });

  const { AppConfigWrapper, ...appConfigProvider } = options.AppConfigWrapper
    ? {
        AppConfigWrapper: options.AppConfigWrapper,
        BaseAppConfigWrapper: options.AppConfigWrapper,
        appConfigContext: { current: null! },
      }
    : makeAppConfigProviderWrapper({ appConfigOptions });

  const composeWrapper = composeProviders(
    AppConfigWrapper,
    UserProviderWrapper,
    BasePreviewPublisherProviderWrapper
  );

  return {
    ...userProvider,
    ...appConfigProvider,
    BasePreviewPublisherProviderWrapper,
    previewPublisherContext,
    PreviewPublisherProviderWrapper: composeWrapper,
  };
}

export default makePreviewPublisherProviderWrapper;
