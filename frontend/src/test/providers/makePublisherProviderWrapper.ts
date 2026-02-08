import { PublisherProvider, PublisherContext } from '@Context/PublisherProvider';
import composeProviders from '@common/helpers/composeProviders';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@common-test/makeGenericProviderWrapper';
import makeSessionProviderWrapper, {
  SessionProviderWrapperOptions,
} from './makeSessionProviderWrapper';
import type { FC, PropsWithChildren } from 'react';

export type PublisherProviderWrapperOptions = {
  publisherOptions?: GenericWrapperOptions<typeof PublisherProvider, typeof PublisherContext>;
  sessionOptions?: SessionProviderWrapperOptions['sessionOptions'];
  userOptions?: SessionProviderWrapperOptions['userOptions'];
  appConfigOptions?: SessionProviderWrapperOptions['appConfigOptions'];
  SessionProviderWrapper?: FC<PropsWithChildren>;
  AppConfigWrapper?: SessionProviderWrapperOptions['AppConfigWrapper'];
  UserProviderWrapper?: SessionProviderWrapperOptions['UserProviderWrapper'];
};

/**
 * Creates wrapper for the PublisherProvider context.
 * The wrapper includes:
 * - AppConfigProvider: you can override its options via appConfigOptions or pass a pre-made AppConfigWrapper
 * - UserProvider: you can override its options via userOptions or pass a pre-made UserProviderWrapper
 * - SessionProvider: you can override its options via sessionOptions or pass a pre-made SessionProviderWrapper
 * - PublisherProvider: you can override its options via publisherOptions
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.publisherOptions] - Options for the PublisherProvider wrapper.
 * @param {GenericWrapperOptions} [options.sessionOptions] - Options for the SessionProvider wrapper.
 * @param {UserProviderWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper.
 * @param {FC} [options.SessionProviderWrapper] - Pre-made SessionProviderWrapper to avoid re-creating it.
 * @param {FC} [options.AppConfigWrapper] - Pre-made AppConfigWrapper to avoid re-creating it.
 * @param {FC} [options.UserProviderWrapper] - Pre-made UserProviderWrapper to avoid re-creating it.
 * @returns {object} The PublisherProvider wrapper (both base and composed), and context getters.
 */
function makePublisherProviderWrapper({
  publisherOptions,
  sessionOptions,
  userOptions,
  appConfigOptions,
  ...options
}: PublisherProviderWrapperOptions = {}) {
  const { SessionProviderWrapper, ...sessionProvider } = options.SessionProviderWrapper
    ? {
        SessionProviderWrapper: options.SessionProviderWrapper,
        BaseSessionProviderWrapper: options.SessionProviderWrapper,
        sessionContext: { current: null! },
        BaseUserProviderWrapper: undefined,
        userContext: { current: null! },
        BaseAppConfigWrapper: undefined,
        appConfigContext: { current: null! },
      }
    : makeSessionProviderWrapper({
        sessionOptions,
        userOptions,
        appConfigOptions,
        AppConfigWrapper: options.AppConfigWrapper,
        UserProviderWrapper: options.UserProviderWrapper,
      });

  const [BasePublisherProviderWrapper, publisherContext] = makeGenericProviderWrapper(
    PublisherProvider,
    PublisherContext,
    publisherOptions
  );

  const composeWrapper = composeProviders(SessionProviderWrapper, BasePublisherProviderWrapper);

  return {
    ...sessionProvider,
    publisherContext,
    PublisherProviderWrapper: composeWrapper,
    BasePublisherProviderWrapper,
  };
}

export default makePublisherProviderWrapper;
