import type { ReactElement, ReactNode } from 'react';
import MiniModeContext, { type MiniModeContextType } from './MiniModeContext';

const unavailableMiniMode: MiniModeContextType = {
  isAvailable: false,
  isOpen: false,
  hostedElement: null,
  enter: () => Promise.resolve(),
  exit: () => undefined,
};

export type UnavailableMiniModeProviderProps = {
  children: ReactNode;
};

/**
 * Provides a Mini Mode that is never available, for hosts that cannot style a Picture-in-Picture window.
 * @param {UnavailableMiniModeProviderProps} props - The meeting room content
 * @returns {ReactElement} The content with Mini Mode turned off
 */
const UnavailableMiniModeProvider = ({
  children,
}: UnavailableMiniModeProviderProps): ReactElement => (
  <MiniModeContext.Provider value={unavailableMiniMode}>{children}</MiniModeContext.Provider>
);

export default UnavailableMiniModeProvider;
