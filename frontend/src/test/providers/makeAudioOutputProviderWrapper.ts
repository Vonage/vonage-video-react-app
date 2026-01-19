import { AudioOutputProvider, AudioOutputContext } from '@Context/AudioOutputProvider';
import makeGenericProviderWrapper, {
  GenericWrapperOptions,
} from '@common/test/makeGenericProviderWrapper';

export type AudioOutputProviderWrapperOptions = {
  audioOutputOptions?: GenericWrapperOptions<typeof AudioOutputProvider, typeof AudioOutputContext>;
};

/**
 * Creates wrapper for the AudioOutputProvider context.
 * Allows accessing the context value for testing.
 * @param {object} options - The wrapper options.
 * @param {GenericWrapperOptions} [options.audioOutputOptions] - Options for the AudioOutputProvider wrapper.
 * @returns The AudioOutputProvider wrapper and context getter.
 */
function makeAudioOutputProviderWrapper({
  audioOutputOptions,
}: AudioOutputProviderWrapperOptions = {}) {
  const [AudioOutputProviderWrapper, audioOutputContext] = makeGenericProviderWrapper(
    AudioOutputProvider,
    AudioOutputContext,
    audioOutputOptions
  );

  return { AudioOutputProviderWrapper, audioOutputContext };
}

export default makeAudioOutputProviderWrapper;
