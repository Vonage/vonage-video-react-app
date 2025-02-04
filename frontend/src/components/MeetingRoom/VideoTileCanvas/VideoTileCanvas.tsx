import { ReactElement, useRef } from 'react';
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

export type VideoTileCanvasProps = {
  isSharingScreen: boolean;
  screensharingPublisher: OTPublisher | null;
  screenshareVideoElement: HTMLVideoElement | HTMLObjectElement | undefined;
  isRightPanelOpen: boolean;
  toggleParticipantList: () => void;
};

/**
 * VideoTileCanvas component
 *
 * A resizable container to layout and display all video tiles.
 * @param {VideoTileCanvasProps} videoTileCanvas props
 * @returns {ReactElement} VideoTileCanvas
 */
const VideoTileCanvas = ({
  isSharingScreen,
  screensharingPublisher,
  screenshareVideoElement,
  isRightPanelOpen,
  toggleParticipantList,
}: VideoTileCanvasProps): ReactElement => {
  // Use a ref on the container div in order to update canvas when resized
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapDimensions = useElementDimensions({ elementRef: wrapRef });

  const activeSpeakerId = useActiveSpeaker();
  const { isPublishing, publisher } = usePublisherContext();
  const getLayout = useLayoutManager();
  const { subscriberWrappers, layoutMode } = useSessionContext();

  // Determine if we will display a large video tile based on current layout mode and screenshare presence
  const isViewingScreenshare = subscriberWrappers.some((subWrapper) => subWrapper.isScreenshare);
  const sessionHasScreenshare = isViewingScreenshare || isSharingScreen;
  const isViewingLargeTile = sessionHasScreenshare || layoutMode === 'active-speaker';
  const hasPinnedSubscribers = subscriberWrappers.some((subWrapper) => subWrapper.isPinned);

  // Check which subscribers we will display, in large calls we will hide some subscribers
  const { hiddenSubscribers, subscribersOnScreen } = getSubscribersToDisplay(
    subscriberWrappers,
    isViewingLargeTile
  );

  // We keep track of the current position of subscribers so we can maintain position to avoid subscribers jumping around the screen
  const subscribersInDisplayOrder = useSubscribersInDisplayOrder(subscribersOnScreen);

  // Get the layout Boxes which specify exact position, height, and width for all video tiles
  const layoutBoxes = getLayoutBoxes({
    activeSpeakerId,
    getLayout,
    hasPinnedSubscribers,
    hiddenSubscribers,
    isSharingScreen,
    layoutMode,
    publisher,
    screensharingPublisher,
    sessionHasScreenshare,
    subscribersInDisplayOrder,
    wrapDimensions,
    wrapRef,
  });

  // Height is 100vh - toolbar height (80px) - 24px wrapper margin
  const heightClass = '@apply h-[calc(100vh_-_104px)]';
  // Width is 100vw - 360px panel width - 24px panel right margin - 24px wrapper margin
  const widthClass = isRightPanelOpen
    ? '@apply w-[calc(100vw_-_392px)]'
    : '@apply w-[calc(100vw_-_24px)]';
  return (
    <div ref={wrapRef} id="wrapper" className={`m-3 ${widthClass} ${heightClass}`}>
      <div id="video-container" className="relative w-full h-full">
        {isPublishing && layoutBoxes.publisherBox && <Publisher box={layoutBoxes.publisherBox} />}
        {isSharingScreen && (
          <ScreenSharePublisher
            publisher={screensharingPublisher}
            box={layoutBoxes.localScreenshareBox}
            element={screenshareVideoElement}
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
            handleClick={toggleParticipantList}
          />
        )}
      </div>
    </div>
  );
};

export default VideoTileCanvas;
