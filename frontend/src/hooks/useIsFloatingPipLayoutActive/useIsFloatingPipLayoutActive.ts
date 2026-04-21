import { isMobile } from '@web/platform';
import useSessionContext from '../useSessionContext';
import useIsSmallViewport from '../useIsSmallViewport';

export type UseIsFloatingPipLayoutActiveArgs = {
  isSharingScreen: boolean;
};

/**
 * Returns whether the 1:1 floating PiP layout should be active.
 *
 * The layout is engaged automatically when the call is a strict 1:1 with no
 * screenshare and the device is either a real mobile (UA-detected) or the
 * viewport is small. It is not user-selectable, and it disengages
 * automatically once any of those conditions breaks (screenshare starts, a
 * third participant joins, or the viewport grows on a non-mobile device).
 */
const useIsFloatingPipLayoutActive = ({
  isSharingScreen,
}: UseIsFloatingPipLayoutActiveArgs): boolean => {
  const isSmallViewport = useIsSmallViewport();
  const { subscriberWrappers } = useSessionContext();
  const isViewingScreenshare = subscriberWrappers.some((subWrapper) => subWrapper.isScreenshare);
  const sessionHasScreenshare = isViewingScreenshare || isSharingScreen;
  const hasExactlyOneRemote = subscriberWrappers.length === 1;
  const isConstrainedDevice = isMobile() || isSmallViewport;
  return (
    isConstrainedDevice &&
    hasExactlyOneRemote &&
    !sessionHasScreenshare &&
    !subscriberWrappers[0].isScreenshare
  );
};

export default useIsFloatingPipLayoutActive;
