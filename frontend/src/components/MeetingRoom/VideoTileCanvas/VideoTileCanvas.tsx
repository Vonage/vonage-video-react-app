import { ReactElement, useMemo, useRef } from 'react';
import { Publisher as OTPublisher } from '@vonage/client-sdk-video';
import useLayoutManager from '../../../hooks/useLayoutManager';
import usePublisherContext from '../../../hooks/usePublisherContext';
import useSessionContext from '../../../hooks/useSessionContext';
import Publisher from '../../Publisher';
import ScreenSharePublisher from '../ScreenSharePublisher';
import Subscriber from '../../Subscriber';
import HiddenParticipantsTile from '../../HiddenParticipantsTile/HiddenParticipantsTile';
import useElementDimensions from '../../../hooks/useElementDimensions';
import getSubscribersToDisplay from '../../../utils/helpers/getSubscribersToDisplay/getSubscribersToDisplay';
import useSubscribersInDisplayOrder from '../../../hooks/useSubscribersInDisplayOrder';
import getLayoutBoxes from '../../../utils/helpers/getLayoutBoxes';
import useActiveSpeaker from '../../../hooks/useActiveSpeaker';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

export type VideoTileCanvasProps = {
  isSharingScreen: boolean;
  isEntireScreen: boolean;
  screensharingPublisher: OTPublisher | null;
  screenshareVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  isRightPanelOpen: boolean;
  fullSize?: boolean;
};

/**
 * VideoTileCanvas component
 *
 * A resizable container to layout and display all video tiles.
 * @param {VideoTileCanvasProps} videoTileCanvas props
 *   @property {boolean} isSharingScreen - Whether the local user is currently sharing their screen
 *   @property {boolean} isEntireScreen - Whether the local user is sharing the entire screen
 *   @property {OTPublisher | null} screensharingPublisher - Local screenshare publisher
 *   @property {HTMLVideoElement | HTMLObjectElement | undefined} screenshareVideoElement - Local screenshare video element
 *   @property {boolean} isRightPanelOpen - Whether the right panel is open
 *   @property {boolean} fullSize - Whether the canvas should use the full available size
 * @returns {ReactElement} VideoTileCanvas
 */
const VideoTileCanvas = ({
  isSharingScreen,
  isEntireScreen,
  screensharingPublisher,
  screenshareVideoElement,
  isRightPanelOpen,
  fullSize = false,
}: VideoTileCanvasProps): ReactElement => {
  // Use a ref on the container div in order to update canvas when resized
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapDimensions = useElementDimensions({ elementRef: wrapRef });

  const activeSpeakerId = useActiveSpeaker();
  const { publisher } = usePublisherContext();
  const getLayout = useLayoutManager();
  const { connected, reconnecting, subscriberWrappers, layoutMode } = useSessionContext();

  // Memoize subscriber-derived values to avoid recomputing on every render
  const pinnedSubscriberCount = useMemo(
    () => subscriberWrappers.filter((subWrapper) => subWrapper.isPinned).length,
    [subscriberWrappers]
  );
  const isViewingScreenshare = useMemo(
    () => subscriberWrappers.some((subWrapper) => subWrapper.isScreenshare),
    [subscriberWrappers]
  );
  const sessionHasScreenshare = isViewingScreenshare || isSharingScreen;
  const isViewingLargeTile =
    sessionHasScreenshare || layoutMode === 'active-speaker' || !!pinnedSubscriberCount;

  // Check which subscribers we will display, in large calls we will hide some subscribers
  const { hiddenSubscribers, subscribersOnScreen } = useMemo(
    () =>
      getSubscribersToDisplay({
        subscriberWrappers,
        isViewingLargeTile,
        isSharingScreen: !!screensharingPublisher,
        pinnedSubscriberCount,
      }),
    [subscriberWrappers, isViewingLargeTile, screensharingPublisher, pinnedSubscriberCount]
  );

  // We keep track of the current position of subscribers so we can maintain position to avoid subscribers jumping around the screen
  const subscribersInDisplayOrder = useSubscribersInDisplayOrder(subscribersOnScreen);

  // Get the layout Boxes which specify exact position, height, and width for all video tiles
  const layoutBoxes = useMemo(
    () =>
      getLayoutBoxes({
        activeSpeakerId,
        getLayout,
        pinnedSubscriberCount,
        hiddenSubscribers,
        isSharingScreen,
        layoutMode,
        publisher,
        screensharingPublisher,
        sessionHasScreenshare,
        subscribersInDisplayOrder,
        wrapDimensions,
        wrapRef,
      }),
    [
      activeSpeakerId,
      getLayout,
      pinnedSubscriberCount,
      hiddenSubscribers,
      isSharingScreen,
      layoutMode,
      publisher,
      screensharingPublisher,
      sessionHasScreenshare,
      subscribersInDisplayOrder,
      wrapDimensions,
    ]
  );

  const isSmallViewport = useIsSmallViewport();

  // Height is 100dvh - toolbar height (80px) and header height (80px) - 24px wrapper margin on small viewport device
  // Height is 100dvh - toolbar height (80px) - 24px wrapper margin on desktop
  const wrapperHeight = useMemo(() => {
    if (fullSize && isSmallViewport) return 'calc(100% - 184px)';
    if (fullSize) return 'calc(100% - 104px)';
    if (isSmallViewport) return 'calc(100dvh - 184px)';
    return 'calc(100dvh - 104px)';
  }, [fullSize, isSmallViewport]);

  // Width is 100vw - 360px panel width - 24px panel right margin - 24px wrapper margin
  const wrapperWidth = useMemo(() => {
    if (fullSize && isRightPanelOpen) return 'calc(100% - 392px)';
    if (fullSize) return 'calc(100% - 24px)';
    if (isRightPanelOpen) return 'calc(100vw - 392px)';
    return 'calc(100vw - 24px)';
  }, [fullSize, isRightPanelOpen]);

  const shouldShowProgress = connected !== true || reconnecting === true;
  const progressTestId =
    reconnecting === true ? 'reconnecting-progress-spinner' : 'progress-spinner';

  return (
    <Box
      ref={wrapRef}
      id="wrapper"
      sx={{
        padding: 3,
        width: wrapperWidth,
        height: wrapperHeight,
      }}
    >
      <Box id="video-container" sx={{ position: 'relative', width: '100%', height: '100%' }}>
        {layoutBoxes.publisherBox && <Publisher box={layoutBoxes.publisherBox} />}
        {isSharingScreen && (
          <ScreenSharePublisher
            publisher={screensharingPublisher}
            box={layoutBoxes.localScreenshareBox}
            element={screenshareVideoElement}
            isEntireScreen={isEntireScreen}
          />
        )}
        {// Note: we still render hidden subscribers with flag `hidden`
        // inside the subscriber component we will unsubscribe to video to save bandwidth
        [...subscribersInDisplayOrder, ...hiddenSubscribers]?.map((subscriberWrapper, index) => (
          <Subscriber
            key={subscriberWrapper.id}
            subscriberWrapper={subscriberWrapper}
            isHidden={!subscribersInDisplayOrder.includes(subscriberWrapper)}
            box={layoutBoxes.subscriberBoxes?.[index]}
            isActiveSpeaker={activeSpeakerId === subscriberWrapper.id}
          />
        ))}
        {!!hiddenSubscribers.length && layoutBoxes.hiddenParticipantsBox && (
          <HiddenParticipantsTile
            hiddenSubscribers={hiddenSubscribers}
            box={layoutBoxes.hiddenParticipantsBox}
          />
        )}

        {shouldShowProgress && (
          <CircularProgress
            data-testid={progressTestId}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default VideoTileCanvas;
