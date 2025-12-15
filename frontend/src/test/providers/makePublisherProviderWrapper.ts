import { PublisherProvider, PublisherContext } from '@Context/PublisherProvider';
import composeProviders from '@utils/composeProviders';
import makeGenericProviderWrapper, { GenericWrapperOptions } from './makeGenericProviderWrapper';
import makeSessionProviderWrapper, {
  SessionProviderWrapperOptions,
} from './makeSessionProviderWrapper';

export type PublisherProviderWrapperOptions = {
  publisherOptions?: GenericWrapperOptions<typeof PublisherProvider, typeof PublisherContext>;
  sessionOptions?: SessionProviderWrapperOptions['sessionOptions'];
  userOptions?: SessionProviderWrapperOptions['userOptions'];
  appConfigOptions?: SessionProviderWrapperOptions['appConfigOptions'];
};

/**
 * Creates wrapper for the PublisherProvider context.
 * The wrapper includes:
 * - AppConfigProvider: you can override its options via appConfigOptions
 * - UserProvider: you can override its options via userOptions
 * - SessionProvider: you can override its options via sessionOptions
 * - PublisherProvider: you can override its options via publisherOptions
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.publisherOptions] - Options for the PublisherProvider wrapper.
 * @param {GenericWrapperOptions} [options.sessionOptions] - Options for the SessionProvider wrapper.
 * @param {UserProviderWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper.
 * @returns {object} The PublisherProvider wrapper and context getters.
 */
function makePublisherProviderWrapper({
  publisherOptions,
  sessionOptions,
  userOptions,
  appConfigOptions,
}: PublisherProviderWrapperOptions = {}) {
  const { SessionProviderWrapper, sessionContext, userContext, appConfigContext } =
    makeSessionProviderWrapper({
      sessionOptions,
      userOptions,
      appConfigOptions,
    });

  const [PublisherProviderWrapper, publisherContext] = makeGenericProviderWrapper(
    PublisherProvider,
    PublisherContext,
    publisherOptions
  );

  const composeWrapper = composeProviders(SessionProviderWrapper, PublisherProviderWrapper);

  return {
    PublisherProviderWrapper: composeWrapper,
    publisherContext,
    sessionContext,
    userContext,
    appConfigContext,
  };
}

export default makePublisherProviderWrapper;
