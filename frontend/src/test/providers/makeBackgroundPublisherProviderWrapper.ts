import {
  BackgroundPublisherProvider,
  BackgroundPublisherContext,
} from '@Context/BackgroundPublisherProvider';
import composeProviders from '@common/helpers/composeProviders';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@common/test/makeGenericProviderWrapper';
import makePublisherProviderWrapper from './makePublisherProviderWrapper';

export type BackgroundPublisherProviderWrapperOptions = {
  backgroundPublisherOptions?: GenericWrapperOptions<
    typeof BackgroundPublisherProvider,
    typeof BackgroundPublisherContext
  >;
  skipAppConfigAndUser?: boolean;
};

/**
 * Creates wrapper for the BackgroundPublisherProvider context.
 * Allows accessing the context value for testing.
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.backgroundPublisherOptions] - Options for the BackgroundPublisherProvider wrapper.
 * @param {boolean} [options.skipAppConfigAndUser] - If true, skips creating AppConfig and User providers in nested providers.
 * @returns The BackgroundPublisherProvider wrapper and context getter.
 */
function makeBackgroundPublisherProviderWrapper({
  backgroundPublisherOptions,
  skipAppConfigAndUser,
}: BackgroundPublisherProviderWrapperOptions = {}) {
  const { PublisherProviderWrapper, ...publisher } = makePublisherProviderWrapper({
    skipAppConfigAndUser,
  });

  const [BackgroundPublisherProviderWrapper, backgroundPublisherContext] =
    makeGenericProviderWrapper(
      BackgroundPublisherProvider,
      BackgroundPublisherContext,
      backgroundPublisherOptions
    );

  const composeWrapper = composeProviders(
    PublisherProviderWrapper,
    BackgroundPublisherProviderWrapper
  );

  return {
    ...publisher,
    backgroundPublisherContext,
    BackgroundPublisherProviderWrapper: composeWrapper,
  };
}

export default makeBackgroundPublisherProviderWrapper;
