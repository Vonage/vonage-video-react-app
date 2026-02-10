import SessionProvider, { SessionContext } from '@Context/SessionProvider/session';
import composeProviders from '@common/helpers/composeProviders';
import makeUserProviderWrapper, { UserProviderWrapperOptions } from './makeUserProviderWrapper';
import makeAppConfigProviderWrapper, {
  AppConfigProviderWrapperOptions,
} from './makeAppConfigProviderWrapper';
import makeGenericProviderWrapper, {
  type GenericWrapperOptions,
} from '@common/test/makeGenericProviderWrapper';

export type SessionProviderWrapperOptions = {
  sessionOptions?: GenericWrapperOptions<typeof SessionProvider, typeof SessionContext>;
  appConfigOptions?: AppConfigProviderWrapperOptions;
  userOptions?: UserProviderWrapperOptions;
};

/**
 * Creates wrapper for the SessionProvider context.
 * The wrapper includes:
 * - AppConfigProvider: you can override its options via appConfigOptions
 * - UserProvider: you can override its options via userOptions
 * - SessionProvider: you can override its options via sessionOptions
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.sessionOptions] - Options for the SessionProvider wrapper.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper.
 * @param {UserProviderWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper.
 * @returns {object} The SessionProvider wrapper and context getters.
 */
function makeSessionProviderWrapper({
  sessionOptions,
  appConfigOptions,
  userOptions,
}: SessionProviderWrapperOptions = {}) {
  const [SessionProviderWrapper, sessionContext] = makeGenericProviderWrapper(
    SessionProvider,
    SessionContext,
    sessionOptions
  );

  const { AppConfigWrapper, appConfigContext } = makeAppConfigProviderWrapper(appConfigOptions);

  const { UserProviderWrapper, userContext } = makeUserProviderWrapper(userOptions);

  const composeWrapper = composeProviders(
    AppConfigWrapper,
    UserProviderWrapper,
    SessionProviderWrapper
  );

  return {
    SessionProviderWrapper: composeWrapper,
    sessionContext,
    userContext,
    appConfigContext,
  };
}

export default makeSessionProviderWrapper;
