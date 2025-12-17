import { useRef, useState, useEffect, ReactElement } from 'react';
import Box from '@ui/Box';
import Stack from '@ui/Stack';
import useTheme from '@ui/theme';
import { VIDEO_CONTAINER_HEIGHT_WR } from '@utils/constants';
import MicButton from '../MicButton';
import CameraButton from '../CameraButton';
import VideoLoading from '../VideoLoading';
import waitUntilPlaying from '../../../utils/waitUntilPlaying';
import useUserContext from '../../../hooks/useUserContext';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';
import getInitials from '../../../utils/getInitials';
import PreviewAvatar from '../PreviewAvatar';
import VoiceIndicatorIcon from '../../MeetingRoom/VoiceIndicator/VoiceIndicator';
import VignetteEffect from '../VignetteEffect';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import BackgroundEffectsDialog from '../BackgroundEffects/BackgroundEffectsDialog';
import BackgroundEffectsButton from '../BackgroundEffects/BackgroundEffectsButton';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import PrecallNetworkTestDialog from '../PrecallNetworkTestDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';

export type VideoContainerProps = {
  username: string;
};

/**
 * VideoContainer Component
 *
 * Loads and displays the preview publisher, a representation of what participants would see in the meeting room.
 * Overlaid onto the preview publisher are the audio input toggle button, video input toggle button, and the background replacement button (if supported).
 * @param {VideoContainerProps} props - The props for the component.
 *  @property {string} username - The user's username.
 * @returns {ReactElement} - The VideoContainer component.
 */
const VideoContainer = ({ username }: VideoContainerProps): ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [{ isOpen: isBackgroundEffectsOpen }, { open, close }] = backgroundEffectsDialog$.use();
  const [{ isOpen: isPrecallNetworkTestOpen }, { close: closePrecallTest }] =
    precallNetworkTestDialog$.use();
  const { user } = useUserContext();
  const { publisherVideoElement, isVideoEnabled, isAudioEnabled, speechLevel } =
    usePreviewPublisherContext();
  const initials = getInitials(username);
  const isSmallViewport = useIsSmallViewport();
  const theme = useTheme();

  useEffect(() => {
    if (publisherVideoElement && containerRef.current && isVideoEnabled) {
      containerRef.current.appendChild(publisherVideoElement);
      const myVideoElement = publisherVideoElement as HTMLElement;
      myVideoElement.classList.add('video__element');
      // eslint-disable-next-line react-hooks/immutability
      myVideoElement.title = 'publisher-preview';
      // eslint-disable-next-line react-hooks/immutability
      myVideoElement.style.borderRadius = isSmallViewport ? '0px' : theme.shapes.borderRadiusLarge;
      myVideoElement.style.height = isSmallViewport ? '' : `${VIDEO_CONTAINER_HEIGHT_WR}px`;
      myVideoElement.style.width = isSmallViewport ? '100dvw' : '584px';
      myVideoElement.style.marginLeft = 'auto';
      myVideoElement.style.marginRight = 'auto';
      myVideoElement.style.transform = 'scaleX(-1)';
      myVideoElement.style.objectFit = 'contain';
      myVideoElement.style.aspectRatio = '16 / 9';

      waitUntilPlaying(publisherVideoElement).then(() => {
        setIsVideoLoading(false);
      });
    }
  }, [isSmallViewport, publisherVideoElement, isVideoEnabled, theme.shapes.borderRadiusLarge]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        aspectRatio: '16 / 9',
        width: { xs: '100dvw', sm: '583px' },
        maxWidth: '100%',
        height: { sm: `${VIDEO_CONTAINER_HEIGHT_WR}px` },
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.secondary,
        borderRadius: { xs: 0, sm: '12px' },
        WebkitMask: `linear-gradient(${theme.colors.secondary} 0 0)`,
      }}
    >
      <Box
        ref={containerRef}
        sx={{ display: isBackgroundEffectsOpen ? 'none' : 'block' }}
        data-video-container
      />
      <VignetteEffect />
      {isVideoLoading && <VideoLoading />}
      <PreviewAvatar
        initials={initials}
        username={user.defaultSettings.name}
        isVideoEnabled={isVideoEnabled}
        isVideoLoading={isVideoLoading}
      />
      {!isVideoLoading && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: '5%',
            display: 'flex',
            height: 'fit-content',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isAudioEnabled && (
            <Box sx={{ position: 'absolute', left: '16px', top: '12px' }}>
              <VoiceIndicatorIcon publisherAudioLevel={speechLevel} size={24} />
            </Box>
          )}
          <Stack direction="row" spacing={1.5}>
            <MicButton />
            <CameraButton />
          </Stack>
          <Box sx={{ position: 'absolute', right: '20px' }}>
            <BackgroundEffectsButton onClick={open} />
            {isBackgroundEffectsOpen && (
              <BackgroundEffectsDialog
                isBackgroundEffectsOpen={true}
                setIsBackgroundEffectsOpen={close}
              />
            )}
            {isPrecallNetworkTestOpen && (
              <PrecallNetworkTestDialog
                isPrecallNetworkTestOpen={isPrecallNetworkTestOpen}
                setIsPrecallNetworkTestOpen={closePrecallTest}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default VideoContainer;
