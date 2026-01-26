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
  /**
   * If true, skips creating AppConfig and User providers (useful when they're already provided at a higher level).
   * Defaults to false for backward compatibility when used standalone.
   */
  skipAppConfigAndUser?: boolean;
};

/**
 * Creates wrapper for the SessionProvider context.
 * The wrapper includes:
 * - AppConfigProvider: you can override its options via appConfigOptions
 * - UserProvider: you can override its options via userOptions
 * - SessionProvider: you can override its options via sessionOptions
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.sessionOptions] - Options for the SessionProvider wrapper.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper (only used if skipAppConfigAndUser is false).
 * @param {UserProviderWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper (only used if skipAppConfigAndUser is false).
 * @param {boolean} [options.skipAppConfigAndUser] - If true, skips creating AppConfig and User providers.
 * @returns {object} The SessionProvider wrapper and context getters.
 */
function makeSessionProviderWrapper({
  sessionOptions,
  appConfigOptions,
  userOptions,
  skipAppConfigAndUser = false,
}: SessionProviderWrapperOptions = {}) {
  const [SessionProviderWrapper, sessionContext] = makeGenericProviderWrapper(
    SessionProvider,
    SessionContext,
    sessionOptions
  );

  // Only create AppConfig and User providers if not skipped (for standalone usage)
  if (skipAppConfigAndUser) {
    return {
      SessionProviderWrapper,
      sessionContext,
    };
  }

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
