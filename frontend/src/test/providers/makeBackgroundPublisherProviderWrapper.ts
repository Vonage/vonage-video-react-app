import {
  BackgroundPublisherProvider,
  BackgroundPublisherContext,
} from '@Context/BackgroundPublisherProvider';
import makeGenericProviderWrapper, { GenericWrapperOptions } from './makeGenericProviderWrapper';

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
  const [BackgroundPublisherProviderWrapper, backgroundPublisherContext] =
    makeGenericProviderWrapper(
      BackgroundPublisherProvider,
      BackgroundPublisherContext,
      backgroundPublisherOptions
    );

  return { BackgroundPublisherProviderWrapper, backgroundPublisherContext };
}

export default makeBackgroundPublisherProviderWrapper;
