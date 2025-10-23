import { ReactElement, useEffect, useRef } from 'react';
import { Box } from 'opentok-layout-js';
import useIsCameraControlAllowed from '@Context/AppConfig/hooks/useIsCameraControlAllowed';
import useIsMicrophoneControlAllowed from '@Context/AppConfig/hooks/useIsMicrophoneControlAllowed';
import usePublisherContext from '../../hooks/usePublisherContext';
import VoiceIndicatorIcon from '../MeetingRoom/VoiceIndicator';
import useAudioLevels from '../../hooks/useAudioLevels';
import AvatarInitials from '../AvatarInitials';
import NameDisplay from '../MeetingRoom/NameDisplay';
import AudioIndicator from '../MeetingRoom/AudioIndicator';
import VideoTile from '../MeetingRoom/VideoTile';

export type PublisherProps = {
  box: Box;
};

/**
 * Publisher component
 *
 * This component renders a VideoTile with Publisher video and an overlay.
 * It consists of a video stream, initials, a publisher speaking indicator, and the user's name.
 * @param {PublisherProps} props - the props for the component
 *  @property {Box} box - the box in which the component is displayed
 * @returns {ReactElement} The publisher component.
 */
const Publisher = ({ box }: PublisherProps): ReactElement => {
  const isCameraControlAllowed = useIsCameraControlAllowed();
  const isMicrophoneControlAllowed = useIsMicrophoneControlAllowed();

  const {
    publisherVideoElement: element,
    isVideoEnabled,
    publisher,
    isAudioEnabled,
  } = usePublisherContext();

  const audioLevel = useAudioLevels();

  // We store this in a ref to get a reference to the div so that we can append a video to it
  const pubContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (element && pubContainerRef.current) {
      element.classList.add(
        'video__element',
        'w-full',
        'h-full',
        'absolute',
        'rounded-xl',
        'object-contain',
        'origin-[50%_50%]', // since we have disabled default UI, we need to mirror the publisher
        '-scale-x-100'
      );
      pubContainerRef.current.appendChild(element);
    }
  }, [element]);

  const initials = publisher?.stream?.initials;
  const username = publisher?.stream?.name ?? '';
  const audioIndicatorStyle =
    'rounded-xl absolute top-3 right-3 bg-darkGray-55 h-6 w-6 items-center justify-center flex m-auto';

  const shouldShowAvatarInitials = !(isCameraControlAllowed && isVideoEnabled);
  const shouldShowVoiceIndicator = !(isMicrophoneControlAllowed && isAudioEnabled);

  return (
    <VideoTile
      id="publisher-container"
      className="publisher relative"
      data-testid="publisher-container"
      box={box}
      ref={pubContainerRef}
      hasVideo={isVideoEnabled}
    >
      {shouldShowAvatarInitials && (
        <AvatarInitials
          initials={initials}
          height={box.height}
          width={box.width}
          username={username}
        />
      )}

      {shouldShowVoiceIndicator && (
        <VoiceIndicatorIcon
          publisherAudioLevel={audioLevel}
          sx={{ position: 'absolute', top: '10px', right: '10px' }}
          size={24}
        />
      )}

      {!shouldShowVoiceIndicator && (
        <AudioIndicator
          hasAudio={isAudioEnabled}
          indicatorStyle={audioIndicatorStyle}
          indicatorColor="white"
          stream={publisher?.stream}
        />
      )}

      <NameDisplay name={username} containerWidth={box.width} />
    </VideoTile>
  );
};

export default Publisher;
