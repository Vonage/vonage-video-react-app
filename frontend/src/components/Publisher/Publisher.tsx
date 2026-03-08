import { ReactElement, useEffect, useRef } from 'react';
import { Box } from 'opentok-layout-js';
import usePublisherContext from '../../hooks/usePublisherContext';
import VoiceIndicatorIcon from '../MeetingRoom/VoiceIndicator';
import useAudioLevels from '../../hooks/useAudioLevels';
import AvatarInitials from '../AvatarInitials';
import NameDisplay from '../MeetingRoom/NameDisplay';
import AudioIndicator from '../MeetingRoom/AudioIndicator';
import VideoTile from '../MeetingRoom/VideoTile';
import useTheme from '@ui/theme';
import { ABSOLUTE_DISTANCE_THRESHOLD_REM_VALUE } from '@utils/constants';
import toRemValue from '@common/helpers/toRemValue';
import useUserContext from '../../hooks/useUserContext';

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
  const {
    publisherVideoElement: element,
    isVideoEnabled,
    publisher,
    isAudioEnabled,
  } = usePublisherContext();
  const audioLevel = useAudioLevels();
  const theme = useTheme();
  const { user } = useUserContext();
  const { mirrorSelfView } = user.defaultSettings;
  // We store this in a ref to get a reference to the div so that we can append a video to it
  const pubContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!element || !pubContainerRef.current) return;

    element.classList.add('video__element');

    // Apply MUI-style inline styles instead of Tailwind classes

    // eslint-disable-next-line react-hooks/immutability
    element.style.width = '100%';
    element.style.height = '100%';
    element.style.position = 'absolute';
    element.style.borderRadius = theme.shapes.borderRadiusLarge;
    element.style.objectFit = 'cover';
    element.style.transformOrigin = '50% 50%';

    pubContainerRef.current.appendChild(element);
  }, [element, theme.shapes.borderRadiusLarge]);

  useEffect(() => {
    if (!element) return;

    // The SDK mirrors the publisher via .OT_mirrored (scale(-1, 1) on .OT_video-element).
    // When mirror is ON, clear the inline style so the SDK's CSS class takes effect.
    // When mirror is OFF, set scaleX(1) to override and cancel the SDK's mirror.
    if (mirrorSelfView) {
      element.style.removeProperty('transform');
    } else {
      // eslint-disable-next-line react-hooks/immutability
      element.style.transform = 'scaleX(1)';
    }
  }, [element, mirrorSelfView]);

  const initials = publisher?.stream?.initials;
  const username = publisher?.stream?.name ?? '';
  const hasVideo = isVideoEnabled && !!element;
  const audioIndicatorStyle: React.CSSProperties = {
    borderRadius: theme.shapes.borderRadiusLarge,
    position: 'absolute',
    top: toRemValue(ABSOLUTE_DISTANCE_THRESHOLD_REM_VALUE),
    right: toRemValue(ABSOLUTE_DISTANCE_THRESHOLD_REM_VALUE),
    backgroundColor: theme.colors.darkBackground,
    height: '1.5rem',
    width: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
  };

  return (
    <VideoTile
      id="publisher-container"
      className="publisher"
      data-testid="publisher-container"
      box={box}
      ref={pubContainerRef}
      hasVideo={hasVideo}
    >
      {!hasVideo && (
        <AvatarInitials
          initials={initials}
          height={box.height}
          width={box.width}
          username={username}
        />
      )}
      {isAudioEnabled ? (
        <VoiceIndicatorIcon
          publisherAudioLevel={audioLevel}
          sx={{ position: 'absolute', top: '10px', right: '10px' }}
          size={24}
        />
      ) : (
        <AudioIndicator
          hasAudio={isAudioEnabled}
          indicatorStyle={audioIndicatorStyle}
          indicatorColor={theme.colors.accent}
        />
      )}
      <NameDisplay name={username} containerWidth={box.width} />
    </VideoTile>
  );
};

export default Publisher;
