import SessionProvider, { SessionContext } from '@Context/SessionProvider/session';
import composeProviders from '@common/helpers/composeProviders';
import makeUserProviderWrapper, { UserProviderWrapperOptions } from './makeUserProviderWrapper';
import makeAppConfigProviderWrapper, {
  AppConfigProviderWrapperOptions,
} from './makeAppConfigProviderWrapper';
import makeGenericProviderWrapper, {
  type GenericWrapperOptions,
} from '@common-test/makeGenericProviderWrapper';
import type { FC, PropsWithChildren } from 'react';
import type { AppConfig } from '@stores/appConfig';

export type SessionProviderWrapperOptions = {
  sessionOptions?: GenericWrapperOptions<typeof SessionProvider, typeof SessionContext>;
  appConfigOptions?: AppConfigProviderWrapperOptions['appConfigOptions'];
  userOptions?: UserProviderWrapperOptions['userOptions'];
  AppConfigWrapper?: FC<
    PropsWithChildren<{
      value?: AppConfig | ((initialValue: AppConfig) => AppConfig) | undefined;
    }>
  >;
  UserProviderWrapper?: FC<PropsWithChildren>;
};

/**
 * Creates wrapper for the SessionProvider context.
 * The wrapper includes:
 * - AppConfigProvider: you can override its options via appConfigOptions or pass a pre-made AppConfigWrapper
 * - UserProvider: you can override its options via userOptions or pass a pre-made UserProviderWrapper
 * - SessionProvider: you can override its options via sessionOptions
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.sessionOptions] - Options for the SessionProvider wrapper.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper.
 * @param {UserProviderWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper.
 * @param {FC} [options.AppConfigWrapper] - Pre-made AppConfigWrapper to avoid re-creating it.
 * @param {FC} [options.UserProviderWrapper] - Pre-made UserProviderWrapper to avoid re-creating it.
 * @returns {object} The SessionProvider wrapper (both base and composed), and context getters.
 */
function makeSessionProviderWrapper({
  sessionOptions,
  appConfigOptions,
  userOptions,
  ...options
}: SessionProviderWrapperOptions = {}) {
  const [BaseSessionProviderWrapper, sessionContext] = makeGenericProviderWrapper(
    SessionProvider,
    SessionContext,
    sessionOptions
  );

  const appConfigResult = options.AppConfigWrapper
    ? { AppConfigWrapper: options.AppConfigWrapper, appConfigContext: { current: null! } }
    : makeAppConfigProviderWrapper({ appConfigOptions });

  const userResult = options.UserProviderWrapper
    ? { UserProviderWrapper: options.UserProviderWrapper, userContext: { current: null! } }
    : makeUserProviderWrapper({ userOptions });

  const { AppConfigWrapper, appConfigContext } = appConfigResult;
  const { UserProviderWrapper, userContext } = userResult;

  const composeWrapper = composeProviders(
    AppConfigWrapper,
    UserProviderWrapper,
    BaseSessionProviderWrapper
  );

  return {
    BaseSessionProviderWrapper,
    SessionProviderWrapper: composeWrapper,
    sessionContext,
    userContext,
    appConfigContext,
  };
}

export default makeSessionProviderWrapper;
