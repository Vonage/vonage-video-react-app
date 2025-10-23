import { useRef, useState, useEffect, ReactElement } from 'react';
import { Stack } from '@mui/material';
import useIsCameraControlAllowed from '@Context/AppConfig/hooks/useIsCameraControlAllowed';
import useIsMicrophoneControlAllowed from '@Context/AppConfig/hooks/useIsMicrophoneControlAllowed';
import useIsBackgroundEffectsAllowed from '@Context/AppConfig/hooks/useIsBackgroundEffectsAllowed';
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
  const isCameraAllowed = useIsCameraControlAllowed();
  const isMicrophoneAllowed = useIsMicrophoneControlAllowed();
  const isBackgroundEffectsAllowed = useIsBackgroundEffectsAllowed();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isVideoLoading, setIsVideoLoading] = useState<boolean>(true);
  const [isBackgroundEffectsOpen, setIsBackgroundEffectsOpen] = useState<boolean>(false);
  const { user } = useUserContext();
  const { publisherVideoElement, isVideoEnabled, isAudioEnabled, speechLevel } =
    usePreviewPublisherContext();
  const initials = getInitials(username);
  const isSmallViewport = useIsSmallViewport();

  useEffect(() => {
    const shouldAttachVideo =
      publisherVideoElement && containerRef.current && isVideoEnabled && isCameraAllowed;

    if (!shouldAttachVideo) {
      return;
    }

    containerRef.current!.appendChild(publisherVideoElement);
    const myVideoElement = publisherVideoElement as HTMLElement;
    myVideoElement.classList.add('video__element');
    myVideoElement.title = 'publisher-preview';
    myVideoElement.style.borderRadius = isSmallViewport ? '0px' : '12px';
    myVideoElement.style.height = isSmallViewport ? '' : '328px';
    myVideoElement.style.width = isSmallViewport ? '100dvw' : '584px';
    myVideoElement.style.marginLeft = 'auto';
    myVideoElement.style.marginRight = 'auto';
    myVideoElement.style.transform = 'scaleX(-1)';
    myVideoElement.style.objectFit = 'contain';
    myVideoElement.style.aspectRatio = '16 / 9';
    myVideoElement.style.boxShadow =
      '0 1px 2px 0 rgba(60, 64, 67, .3), 0 1px 3px 1px rgba(60, 64, 67, .15)';

    waitUntilPlaying(publisherVideoElement).then(() => {
      setIsVideoLoading(false);
    });
  }, [isSmallViewport, publisherVideoElement, isVideoEnabled]);

  return (
    <div
      className="relative flex aspect-video w-[584px] max-w-full flex-col items-center justify-center bg-black sm:h-[328px] md:rounded-xl animate-fade-in"
      // this was added because overflow: hidden causes issues with rendering
      // see https://stackoverflow.com/questions/77748631/element-rounded-corners-leaking-out-to-front-when-using-overflow-hidden
      style={{ WebkitMask: 'linear-gradient(#000 0 0)' }}
    >
      <div
        ref={containerRef}
        style={{
          display: isBackgroundEffectsOpen && isBackgroundEffectsAllowed ? 'none' : 'block',
        }}
        data-video-container
      />

      <VignetteEffect />

      {isVideoLoading && isCameraAllowed && <VideoLoading />}

      <PreviewAvatar
        initials={initials}
        username={user.defaultSettings.name}
        isVideoEnabled={isVideoEnabled && isCameraAllowed}
        isVideoLoading={isVideoLoading && isCameraAllowed}
      />

      {!isVideoLoading && isCameraAllowed && (
        <div className="absolute inset-x-0 bottom-[5%] flex h-fit items-center justify-center">
          {isAudioEnabled && isMicrophoneAllowed && (
            <div className="absolute left-6 top-8">
              <VoiceIndicatorIcon publisherAudioLevel={speechLevel} size={24} />
            </div>
          )}

          <Stack direction="row" spacing={2}>
            {isMicrophoneAllowed && <MicButton />}
            {isCameraAllowed && <CameraButton />}
          </Stack>

          <div className="absolute right-[20px]">
            {isBackgroundEffectsAllowed && (
              <>
                <BackgroundEffectsButton onClick={() => setIsBackgroundEffectsOpen(true)} />

                <BackgroundEffectsDialog
                  isBackgroundEffectsOpen={isBackgroundEffectsOpen}
                  setIsBackgroundEffectsOpen={setIsBackgroundEffectsOpen}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoContainer;
