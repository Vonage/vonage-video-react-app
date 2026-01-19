import makeGenericProviderWrapper, {
  type GenericWrapperOptions,
} from '@web-test/makeGenericProviderWrapper';
import UserProvider, { UserContext } from '@Context/user';

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
function makeUserProviderWrapper(options: UserProviderWrapperOptions = {}) {
  const [wrapper, context] = makeGenericProviderWrapper(UserProvider, UserContext, options);

  return {
    wrapper,
    context,
  };
}

export default makeUserProviderWrapper;
