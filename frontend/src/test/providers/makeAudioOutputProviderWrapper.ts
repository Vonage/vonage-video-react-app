import { AudioOutputProvider, AudioOutputContext } from '@Context/AudioOutputProvider';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@common-test/makeGenericProviderWrapper';

export type AudioOutputProviderWrapperOptions = GenericWrapperOptions<
  typeof AudioOutputProvider,
  typeof AudioOutputContext
>;

/**
 * Creates wrapper for the AudioOutputProvider context.
 * Allows accessing the context value for testing.
 * @param {object} options - The wrapper options.
 * @returns The AudioOutputProvider wrapper and context getter.
 */
function makeAudioOutputProviderWrapper(options: AudioOutputProviderWrapperOptions = {}) {
  const [wrapper, context] = makeGenericProviderWrapper(
    AudioOutputProvider,
    AudioOutputContext,
    options
  );

  return {
    wrapper,
    context,
  };
}

export default makeAudioOutputProviderWrapper;
