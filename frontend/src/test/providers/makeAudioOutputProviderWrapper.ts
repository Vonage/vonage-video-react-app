import { AudioOutputProvider, AudioOutputContext } from '@Context/AudioOutputProvider';
import makeGenericProviderWrapper, { GenericWrapperOptions } from './makeGenericProviderWrapper';

export type AudioOutputProviderWrapperOptions = GenericWrapperOptions<
  typeof AudioOutputProvider,
  typeof AudioOutputContext
>;

/**
 * Creates wrapper for the AudioOutputProvider context.
 * Allows accessing the context value for testing.
 * @param options - The wrapper options.
 * @returns The AudioOutputProvider wrapper and context getter.
 */
function makeAudioOutputProviderWrapper(options?: AudioOutputProviderWrapperOptions) {
  const [AudioOutputProviderWrapper, audioOutputContext] = makeGenericProviderWrapper(
    AudioOutputProvider,
    AudioOutputContext,
    options
  );

  return { AudioOutputProviderWrapper, audioOutputContext };
}

export default makeAudioOutputProviderWrapper;
