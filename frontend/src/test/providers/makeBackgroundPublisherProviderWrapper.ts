import {
  BackgroundPublisherProvider,
  BackgroundPublisherContext,
} from '@Context/BackgroundPublisherProvider';
import composeProviders from '@utils/composeProviders';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@common/test/makeGenericProviderWrapper';
import makePublisherProviderWrapper from './makePublisherProviderWrapper';

export type BackgroundPublisherProviderWrapperOptions = {
  backgroundPublisherOptions?: GenericWrapperOptions<
    typeof BackgroundPublisherProvider,
    typeof BackgroundPublisherContext
  >;
};

/**
 * Creates wrapper for the BackgroundPublisherProvider context.
 * Allows accessing the context value for testing.
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.backgroundPublisherOptions] - Options for the BackgroundPublisherProvider wrapper.
 * @returns The BackgroundPublisherProvider wrapper and context getter.
 */
function makeBackgroundPublisherProviderWrapper({
  backgroundPublisherOptions,
}: BackgroundPublisherProviderWrapperOptions = {}) {
  const { PublisherProviderWrapper, ...publisher } = makePublisherProviderWrapper();

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
