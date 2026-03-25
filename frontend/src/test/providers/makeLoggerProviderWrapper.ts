import LoggerProvider from '@Context/LoggerProvider';
import { LoggerContext } from '@Context/LoggerProvider/LoggerProvider';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@web-test/makeGenericProviderWrapper';

export type LoggerProviderWrapperOptions = GenericWrapperOptions<
  typeof LoggerProvider,
  typeof LoggerContext
>;

/**
 * Creates wrapper for the LoggerProvider context.
 * Allows intercepting context values via options and accessing the current log context.
 * @param {object} options - The wrapper options.
 * @returns {object} The LoggerProvider wrapper and context getter.
 */
function makeLoggerProviderWrapper(options: LoggerProviderWrapperOptions = {}) {
  const [wrapper, context] = makeGenericProviderWrapper(LoggerProvider, LoggerContext, options);

  return {
    wrapper,
    context,
  };
}

export default makeLoggerProviderWrapper;
