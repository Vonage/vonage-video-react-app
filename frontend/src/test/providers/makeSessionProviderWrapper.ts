import SessionProvider, { SessionContext } from '@Context/SessionProvider/session';
import composeProviders from '@utils/composeProviders';
import makeGenericProviderWrapper, { GenericWrapperOptions } from './makeGenericProviderWrapper';
import makeUserProviderWrapper, { UserProviderWrapperOptions } from './makeUserProviderWrapper';
import makeAppConfigProviderWrapper, {
  AppConfigProviderWrapperOptions,
} from './makeAppConfigProviderWrapper';

export type SessionProviderWrapperOptions = GenericWrapperOptions<
  typeof SessionProvider,
  typeof SessionContext
> & {
  appConfigOptions?: AppConfigProviderWrapperOptions;
  userOptions?: UserProviderWrapperOptions;
};

/**
 * Creates wrapper for the SessionProvider context.
 * The wrapper includes:
 * - AppConfigProvider: you can override its options via appConfigOptions
 * - UserProvider: you can override its options via userOptions
 * - SessionProvider: you can override its options via the rest of the options
 * @param {object} options - The wrapper options.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper.
 * @param {UserProviderWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper.
 * @returns {object} The SessionProvider wrapper and context getters.
 */
function makeSessionProviderWrapper({
  appConfigOptions,
  userOptions,
  ...sessionOptions
}: SessionProviderWrapperOptions = {}) {
  const { AppConfigWrapper, appConfigContext } = makeAppConfigProviderWrapper(appConfigOptions);

  const { UserProviderWrapper, userContext } = makeUserProviderWrapper(userOptions);

  const [SessionProviderWrapper, sessionContext] = makeGenericProviderWrapper(
    SessionProvider,
    SessionContext,
    sessionOptions
  );

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
