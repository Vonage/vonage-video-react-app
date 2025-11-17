import UserProvider, { UserContext } from '@Context/user';
import makeGenericProviderWrapper, { GenericWrapperOptions } from './makeGenericProviderWrapper';

export type UserProviderWrapperOptions = GenericWrapperOptions<
  typeof UserProvider,
  typeof UserContext
>;

/**
 * Creates wrapper for the UserProvider context.
 * Allows overriding context values via options and accessing the context value.
 * @param {object} options - The wrapper options.
 * @returns {object} The UserProvider wrapper and context getter.
 */
function makeUserProviderWrapper(options?: UserProviderWrapperOptions) {
  const [UserProviderWrapper, userContext] = makeGenericProviderWrapper(
    UserProvider,
    UserContext,
    options
  );

  return { UserProviderWrapper, userContext };
}

export default makeUserProviderWrapper;
