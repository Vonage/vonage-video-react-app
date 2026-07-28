import { ReactElement, ReactNode, createContext } from 'react';
import useScreenShare from '../../hooks/useScreenShare';

export type ScreenShareContextType = ReturnType<typeof useScreenShare>;
export const ScreenShareContext = createContext({} as ScreenShareContextType);

export type ScreenShareProviderProps = {
  children: ReactNode;
};

/**
 * ScreenShareProvider - React Context Provider for ScreenShareContext
 * ScreenShareContext contains all state and methods for the local screen-share publisher.
 * The publisher used to live inside useScreenShare and was reachable only through
 * useMeetingRoom, so components rendered as siblings of the meeting room - the Settings
 * dialog in particular - had no way to read it.
 * See useScreenShare.tsx for methods and state.
 * @param {ScreenShareProviderProps} props - The provider properties
 *  @property {ReactNode} children - The content to be rendered
 * @returns {ReactElement} a context provider for the screen-share publisher
 */
export const ScreenShareProvider = ({ children }: ScreenShareProviderProps): ReactElement => {
  const screenShareContext = useScreenShare();

  return (
    <ScreenShareContext.Provider value={screenShareContext}>{children}</ScreenShareContext.Provider>
  );
};
