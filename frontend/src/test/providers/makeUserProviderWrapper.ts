import makeGenericProviderWrapper, {
  type GenericWrapperOptions,
} from '@common/test/makeGenericProviderWrapper';
import UserProvider, { UserContext } from '@Context/user';

export type UserProviderWrapperOptions = {
  userOptions?: GenericWrapperOptions<typeof UserProvider, typeof UserContext>;
};

/**
 * Creates wrapper for the UserProvider context.
 * Allows overriding context values via options and accessing the context value.
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper.
 * @returns {object} The UserProvider wrapper and context getter.
 */
function makeUserProviderWrapper({ userOptions }: UserProviderWrapperOptions = {}) {
  const [UserProviderWrapper, userContext] = makeGenericProviderWrapper(
    UserProvider,
    UserContext,
    userOptions
  );

  return { UserProviderWrapper, userContext };
}

export default makeUserProviderWrapper;
