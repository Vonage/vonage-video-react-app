import { MouseEvent, ReactElement, useEffect, useRef, useState } from 'react';
import { Box } from 'opentok-layout-js';
import { SubscriberWrapper } from '../../types/session';
import AudioIndicator from '../MeetingRoom/AudioIndicator';
import useSubscriberTalking from '../../hooks/useSubscriberTalking';
import AvatarInitials from '../AvatarInitials';
import ScreenShareNameDisplay from '../ScreenShareNameDisplay';
import NameDisplay from '../MeetingRoom/NameDisplay';
import VideoTile from '../MeetingRoom/VideoTile';
import PinButton from '../MeetingRoom/PinButton';
import useSessionContext from '../../hooks/useSessionContext';
import isMouseEventInsideBox from '../../utils/isMouseEventInsideBox';

export type SubscriberProps = {
  subscriberWrapper: SubscriberWrapper;
  isHidden: boolean;
  box: Box | undefined;
  isActiveSpeaker: boolean;
};

type ConnectionStatusBadgeProps = {
  hasQualityWarning: boolean;
  isVideoDisrupted: boolean;
};

const ConnectionStatusBadge = ({
  hasQualityWarning,
  isVideoDisrupted,
}: ConnectionStatusBadgeProps) => {
  if (!hasQualityWarning && !isVideoDisrupted) {
    return null;
  }

  const badgeClasses = isVideoDisrupted ? 'bg-red-600 text-white' : 'bg-amber-500 text-black';

  const tooltipText = isVideoDisrupted
    ? 'Video paused due to connection issues'
    : 'Connection quality degraded';

  return (
    <div
      className={`absolute left-3 top-3 ${badgeClasses} z-10 rounded-lg px-2 py-1 text-xs font-medium shadow-lg`}
      title={tooltipText}
    >
      {isVideoDisrupted ? (
        <span className="flex items-center gap-1">⏸ PAUSED</span>
      ) : (
        <span className="flex items-center gap-1">⚠ SLOW</span>
      )}
    </div>
  );
};

/**
 * Subscriber Component
 *
 * Displays the Subscriber with an accompanying name tag. An audio indicator is displayed for non-screenshare subscribers, notifying meeting participants when the subscriber is publishing audio.
 * For each subscriber, the initials are displayed if `publishVideo` is off.
 * @param {SubscriberProps} props - The props for the component.
 *  @property {SubscriberWrapper} subscriberWrapper - The SubscriberWrapper for the Subscriber.
 *  @property {boolean} isHidden - Whether the participant is hidden.
 *  @property {Box | undefined} box - The Box of the parent element.
 *  @property {boolean} isActiveSpeaker - Whether the participant is the active speaker.
 * @returns {ReactElement} - The Subscriber component.
 */
const Subscriber = ({
  subscriberWrapper,
  isHidden,
  box,
  isActiveSpeaker,
}: SubscriberProps): ReactElement => {
  const { isMaxPinned, pinSubscriber, videoQualityWarnings, videoDisabledStreams } =
    useSessionContext();
  const { isPinned, subscriber } = subscriberWrapper;
  const isScreenShare = subscriber?.stream?.videoType === 'screen';
  const subRef = useRef<HTMLDivElement>(null);
  const isTalking = useSubscriberTalking({ subscriber, isActiveSpeaker });
  const [isTileHovered, setIsTileHovered] = useState<boolean>(false);

  const streamId = subscriberWrapper.id;
  const hasQualityWarning = videoQualityWarnings.has(streamId);
  const isVideoDisrupted = videoDisabledStreams.has(streamId);

  useEffect(() => {
    // If hidden - Unsubscribe from video to save bandwidth and cpu
    // If not hidden - re-subscribe to video
    subscriberWrapper.subscriber.subscribeToVideo(!isHidden);
  }, [isHidden, subscriberWrapper.subscriber]);

  useEffect(() => {
    if (subscriberWrapper && subRef.current) {
      const { element } = subscriberWrapper;
      element.id = subscriberWrapper.id;
      element.classList.add(
        'video__element',
        'w-full',
        'h-full',
        'absolute',
        'rounded-xl',
        'object-contain'
      );
      subRef.current.appendChild(element);
    }
  }, [subscriberWrapper, isScreenShare]);

  const handlePinClick = (clickEvent: MouseEvent<HTMLButtonElement>) => {
    pinSubscriber(subscriberWrapper.id);
    // We set hovering to false manually since onMouseLeave is not invoked when the DOM Element is moved.
    setIsTileHovered(false);
    // In case the DOM Element didn't move, which can happen if pinning while viewing screenshare -
    // we use setTimeout to let the new layout render, then check if the element is still under the click event location.
    // If so we re-enable the hover state.
    setTimeout(() => {
      if (subRef.current) {
        const divRect = subRef.current.getBoundingClientRect();
        if (isMouseEventInsideBox(clickEvent, divRect)) {
          setIsTileHovered(true);
        }
      }
    }, 0);
  };

  const hasVideo = subscriberWrapper.subscriber?.stream?.hasVideo;
  const initials = subscriberWrapper.subscriber?.stream?.initials;
  const username = subscriberWrapper.subscriber?.stream?.name ?? '';
  const hasAudio = subscriberWrapper.subscriber.stream?.hasAudio;
  const audioIndicatorStyle =
    'rounded-xl absolute top-3 right-3 bg-darkGray-55 h-6 w-6 items-center justify-center flex m-auto';

  return (
    <VideoTile
      id={`${subscriberWrapper.id}`}
      className={isScreenShare ? 'screen-subscriber' : 'subscriber'}
      data-testid={`subscriber-container-${subscriberWrapper.id}`}
      isHidden={isHidden}
      box={box}
      hasVideo={!!hasVideo}
      ref={subRef}
      isTalking={isTalking}
      onMouseEnter={() => setIsTileHovered(true)}
      onMouseLeave={() => setIsTileHovered(false)}
      isScreenshare={isScreenShare}
    >
      {!isScreenShare && (
        <PinButton
          isPinned={isPinned}
          isTileHovered={isTileHovered}
          isMaxPinned={isMaxPinned}
          handleClick={handlePinClick}
          participantName={username}
        />
      )}

      <ConnectionStatusBadge
        hasQualityWarning={hasQualityWarning}
        isVideoDisrupted={isVideoDisrupted}
      />

      {!isScreenShare && (
        <AudioIndicator
          hasAudio={hasAudio}
          stream={subscriber.stream}
          indicatorStyle={audioIndicatorStyle}
          indicatorColor="white"
          participantName={username}
        />
      )}

      {!hasVideo && (
        <AvatarInitials
          initials={initials}
          username={username}
          height={box?.height}
          width={box?.width}
        />
      )}
      {box &&
        (isScreenShare ? (
          <ScreenShareNameDisplay name={username} box={box} />
        ) : (
          <NameDisplay name={username} containerWidth={box.width} />
        ))}
    </VideoTile>
  );
};

export default Subscriber;
