import { useContext } from 'react';
import { ScreenShareContext } from '../Context/ScreenShareProvider';
import type { ScreenShareContextType } from '../Context/ScreenShareProvider';

/**
 * React hook to access the ScreenShare context containing the local screen-share publisher and
 * its controls. Outside of a ScreenShareProvider - the waiting room, where the Settings dialog is
 * also mounted - this returns an empty context, so consumers must treat the publisher as optional.
 * @returns {ScreenShareContextType} - The current context value for the ScreenShare Context.
 */
const useScreenShareContext = (): ScreenShareContextType => useContext(ScreenShareContext);

export default useScreenShareContext;
