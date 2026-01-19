import { PublisherProvider, PublisherContext } from '@Context/PublisherProvider';
import composeProviders from '@utils/composeProviders';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@common/test/makeGenericProviderWrapper';
import makeSessionProviderWrapper, {
  SessionProviderWrapperOptions,
} from './makeSessionProviderWrapper';

export type PublisherProviderWrapperOptions = {
  publisherContext?: GenericWrapperOptions<typeof PublisherProvider, typeof PublisherContext>;
  sessionContext?: SessionProviderWrapperOptions['sessionOptions'];
  userOptions?: SessionProviderWrapperOptions['userOptions'];
  appConfigOptions?: SessionProviderWrapperOptions['appConfigOptions'];
};

/**
 * Creates wrapper for the PublisherProvider context.
 * The wrapper includes:
 * - AppConfigProvider: you can override its options via appConfigOptions
 * - UserProvider: you can override its options via userOptions
 * - SessionProvider: you can override its options via sessionContext
 * - PublisherProvider: you can override its options via publisherContext
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.publisherContext] - Options for the PublisherProvider wrapper.
 * @param {GenericWrapperOptions} [options.sessionContext] - Options for the SessionProvider wrapper.
 * @param {UserProviderWrapperOptions} [options.userOptions] - Options for the UserProvider wrapper.
 * @param {AppConfigProviderWrapperOptions} [options.appConfigOptions] - Options for the AppConfigProvider wrapper.
 * @returns {object} The PublisherProvider wrapper and context getters.
 */
function makePublisherProviderWrapper({
  publisherContext: publisherOptions,
  sessionContext: sessionOptions,
  userOptions,
  appConfigOptions,
}: PublisherProviderWrapperOptions = {}) {
  const { SessionProviderWrapper, ...session } = makeSessionProviderWrapper({
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
    ...session,
    publisherContext,
    PublisherProviderWrapper: composeWrapper,
  };
}

export default makePublisherProviderWrapper;
