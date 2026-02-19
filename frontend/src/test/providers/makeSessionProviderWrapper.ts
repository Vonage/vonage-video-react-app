import SessionProvider, { SessionContext } from '@Context/SessionProvider/session';
import makeGenericProviderWrapper, {
  type GenericWrapperOptions,
} from '@web-test/makeGenericProviderWrapper';

export type SessionProviderWrapperOptions = GenericWrapperOptions<
  typeof SessionProvider,
  typeof SessionContext
>;

/**
 * Creates wrapper for the SessionProvider context.
 * Allows overriding context values via options and accessing the context value.
 * @param {object} options - The wrapper options.
 * @returns {object} The SessionProvider wrapper and context getter.
 */
function makeSessionProviderWrapper(options: SessionProviderWrapperOptions = {}) {
  const [wrapper, context] = makeGenericProviderWrapper(SessionProvider, SessionContext, options);

  return {
    wrapper,
    context,
  };
}

export default makeSessionProviderWrapper;
