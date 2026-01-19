import { ReactNode, createContext } from 'react';
import useAudioOutput from './useAudioOutput';

export type AudioOutputContextType = ReturnType<typeof useAudioOutput>;
export const AudioOutputContext = createContext({} as AudioOutputContextType);

export type AudioOutputProviderProps = {
  children: ReactNode;
};

/**
 *
 * @param {AudioOutputProviderProps} props - The provider properties
 *  @property {ReactNode} children - The content to be rendered
 * @returns {AudioOutputContext} A context provider for the audio output device
 */
export const AudioOutputProvider = ({ children }: { children: ReactNode }) => {
  const audioOutputContext = useAudioOutput();

  return (
    <AudioOutputContext.Provider value={audioOutputContext}>{children}</AudioOutputContext.Provider>
  );
};
