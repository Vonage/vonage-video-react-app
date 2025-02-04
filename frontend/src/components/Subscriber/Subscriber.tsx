import { ReactElement, useEffect, useRef, useState } from 'react';
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

export type SubscriberProps = {
  subscriberWrapper: SubscriberWrapper;
  isHidden: boolean;
  box: Box | undefined;
  isActiveSpeaker: boolean;
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
  const { pinSubscriber } = useSessionContext();
  const { isPinned, subscriber } = subscriberWrapper;
  const isScreenShare = subscriber?.stream?.videoType === 'screen';
  const subRef = useRef<HTMLDivElement>(null);
  const isTalking = useSubscriberTalking({ subscriber, isActiveSpeaker });

  useEffect(() => {
    // If hidden - Unsubscribe from video to save bandwidth and cpu
    // If not hidden - re-subscribe to video
    subscriberWrapper.subscriber.subscribeToVideo(!isHidden);
  }, [isHidden, subscriberWrapper.subscriber]);

  useEffect(() => {
    if (subscriberWrapper && subRef.current) {
      const { element } = subscriberWrapper;
      element.id = subscriberWrapper.id;
      const objectFit = isScreenShare ? 'object-contain' : 'object-cover';
      element.classList.add(
        'video__element',
        'w-full',
        'h-full',
        'absolute',
        'rounded-xl',
        objectFit
      );
      subRef.current.appendChild(element);
    }
  }, [subscriberWrapper, isScreenShare]);

  const hasVideo = subscriberWrapper.subscriber?.stream?.hasVideo;
  const initials = subscriberWrapper.subscriber?.stream?.initials;
  const username = subscriberWrapper.subscriber?.stream?.name ?? '';
  const hasAudio = subscriberWrapper.subscriber.stream?.hasAudio;
  const audioIndicatorStyle =
    'rounded-xl absolute top-3 right-3 bg-darkGray-55 h-6 w-6 items-center justify-center flex m-auto';
  const pinStyle = `${isPinned ? 'flex' : 'hidden'} group-hover/video-tile:flex rounded-xl absolute top-3 left-3 bg-darkGray-55 h-6 w-6 items-center justify-center m-auto`;
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
    >
      {!isScreenShare && (
        <PinButton
          color="white"
          isPinned={isPinned}
          pinStyle={pinStyle}
          toggleIsPinned={() => {
            pinSubscriber(subscriberWrapper.id);
          }}
          participantName={username}
        />
      )}
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
