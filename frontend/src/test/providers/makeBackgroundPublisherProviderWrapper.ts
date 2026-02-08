import {
  BackgroundPublisherProvider,
  BackgroundPublisherContext,
} from '@Context/BackgroundPublisherProvider';
import composeProviders from '@common/helpers/composeProviders';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@common-test/makeGenericProviderWrapper';
import makePublisherProviderWrapper, {
  PublisherProviderWrapperOptions,
} from './makePublisherProviderWrapper';
import type { FC, PropsWithChildren } from 'react';

export type BackgroundPublisherProviderWrapperOptions = {
  backgroundPublisherOptions?: GenericWrapperOptions<
    typeof BackgroundPublisherProvider,
    typeof BackgroundPublisherContext
  >;
  publisherOptions?: PublisherProviderWrapperOptions['publisherOptions'];
  sessionOptions?: PublisherProviderWrapperOptions['sessionOptions'];
  userOptions?: PublisherProviderWrapperOptions['userOptions'];
  appConfigOptions?: PublisherProviderWrapperOptions['appConfigOptions'];
  PublisherProviderWrapper?: FC<PropsWithChildren>;
  SessionProviderWrapper?: PublisherProviderWrapperOptions['SessionProviderWrapper'];
  AppConfigWrapper?: PublisherProviderWrapperOptions['AppConfigWrapper'];
  UserProviderWrapper?: PublisherProviderWrapperOptions['UserProviderWrapper'];
};

/**
 * Creates wrapper for the BackgroundPublisherProvider context.
 * The wrapper includes:
 * - AppConfigProvider: you can override its options via appConfigOptions or pass a pre-made AppConfigWrapper
 * - UserProvider: you can override its options via userOptions or pass a pre-made UserProviderWrapper
 * - SessionProvider: you can override its options via sessionOptions or pass a pre-made SessionProviderWrapper
 * - PublisherProvider: you can override its options via publisherOptions or pass a pre-made PublisherProviderWrapper
 * - BackgroundPublisherProvider: you can override its options via backgroundPublisherOptions
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.backgroundPublisherOptions] - Options for the BackgroundPublisherProvider wrapper.
 * @param {PublisherProviderWrapperOptions} [options.publisherOptions] - Options for the PublisherProvider wrapper.
 * @param {SessionProviderWrapperOptions} [options.sessionOptions] - Options for the SessionProvider wrapper.
 * @param {UserProviderWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper.
 * @param {FC} [options.PublisherProviderWrapper] - Pre-made PublisherProviderWrapper to avoid re-creating it.
 * @param {FC} [options.SessionProviderWrapper] - Pre-made SessionProviderWrapper to avoid re-creating it.
 * @param {FC} [options.AppConfigWrapper] - Pre-made AppConfigWrapper to avoid re-creating it.
 * @param {FC} [options.UserProviderWrapper] - Pre-made UserProviderWrapper to avoid re-creating it.
 * @returns The BackgroundPublisherProvider wrapper (both base and composed), and context getters.
 */
function makeBackgroundPublisherProviderWrapper({
  backgroundPublisherOptions,
  publisherOptions,
  sessionOptions,
  userOptions,
  appConfigOptions,
  ...options
}: BackgroundPublisherProviderWrapperOptions = {}) {
  const publisherResult = options.PublisherProviderWrapper
    ? {
        PublisherProviderWrapper: options.PublisherProviderWrapper,
        BasePublisherProviderWrapper: options.PublisherProviderWrapper,
        BaseSessionProviderWrapper: undefined,
        publisherContext: { current: null! },
        sessionContext: { current: null! },
        userContext: { current: null! },
        appConfigContext: { current: null! },
      }
    : makePublisherProviderWrapper({
        publisherOptions,
        sessionOptions,
        userOptions,
        appConfigOptions,
        SessionProviderWrapper: options.SessionProviderWrapper,
        AppConfigWrapper: options.AppConfigWrapper,
        UserProviderWrapper: options.UserProviderWrapper,
      });

  const {
    PublisherProviderWrapper,
    BasePublisherProviderWrapper,
    BaseSessionProviderWrapper,
    ...publisher
  } = publisherResult;

  const [BaseBackgroundPublisherProviderWrapper, backgroundPublisherContext] =
    makeGenericProviderWrapper(
      BackgroundPublisherProvider,
      BackgroundPublisherContext,
      backgroundPublisherOptions
    );

  const composeWrapper = composeProviders(
    PublisherProviderWrapper,
    BaseBackgroundPublisherProviderWrapper
  );

  return {
    ...publisher,
    BaseBackgroundPublisherProviderWrapper,
    BasePublisherProviderWrapper,
    BaseSessionProviderWrapper,
    backgroundPublisherContext,
    BackgroundPublisherProviderWrapper: composeWrapper,
  };
}

export default makeBackgroundPublisherProviderWrapper;
