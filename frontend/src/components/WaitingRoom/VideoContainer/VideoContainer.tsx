import { useRef, useState, useEffect, ReactElement } from 'react';
import { Box, Stack } from '@mui/material';
import waitUntilPlaying from '@utils/waitUntilPlaying';
import useUserContext from '@hooks/useUserContext';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import getInitials from '@utils/getInitials';
import useIsSmallViewport from '@hooks/useIsSmallViewport';
import useIsCameraControlAllowed from '@hooks/useIsCameraControlAllowed';
import useConfigContext from '@hooks/useConfigContext';
import classNames from 'classnames';
import MicButton from '../MicButton';
import CameraButton from '../CameraButton';
import VideoLoading from '../VideoLoading';
import PreviewAvatar from '../PreviewAvatar';
import VoiceIndicatorIcon from '../../MeetingRoom/VoiceIndicator/VoiceIndicator';
import VignetteEffect from '../VignetteEffect';
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
  const isAppConfigLoaded = useConfigContext(({ isLoaded }) => isLoaded);
  const isCameraControlAllowed = useIsCameraControlAllowed();

  const containerRef = useRef<HTMLDivElement>(null);

  const [isWaitingPlayVideo, setIsWaitingPlayVideo] = useState<boolean>(false);
  const [isBackgroundEffectsOpen, setIsBackgroundEffectsOpen] = useState<boolean>(false);
  const { user } = useUserContext();

  const { publisherVideoElement, isVideoEnabled, isAudioEnabled, speechLevel } =
    usePreviewPublisherContext();

  const initials = getInitials(username);
  const isSmallViewport = useIsSmallViewport();

  useEffect(() => {
    const shouldPublishVideo = publisherVideoElement && isCameraControlAllowed;

    if (!containerRef.current || !shouldPublishVideo) {
      return;
    }

    setIsWaitingPlayVideo(true);

    containerRef.current.appendChild(publisherVideoElement);
    const myVideoElement = publisherVideoElement as HTMLElement;
    myVideoElement.classList.add('video__element');
    myVideoElement.title = 'publisher-preview';
    myVideoElement.style.borderRadius = isSmallViewport ? '0px' : '12px';
    myVideoElement.style.height = isSmallViewport ? '' : '100%';
    myVideoElement.style.width = isSmallViewport ? '100dvw' : '584px';
    myVideoElement.style.marginLeft = 'auto';
    myVideoElement.style.marginRight = 'auto';
    myVideoElement.style.transform = 'scaleX(-1)';
    myVideoElement.style.objectFit = 'contain';
    myVideoElement.style.aspectRatio = '16 / 9';
    myVideoElement.style.boxShadow =
      '0 1px 2px 0 rgba(60, 64, 67, .3), 0 1px 3px 1px rgba(60, 64, 67, .15)';

    waitUntilPlaying(publisherVideoElement).then(() => {
      setIsWaitingPlayVideo(false);
    });
  }, [isSmallViewport, publisherVideoElement, isVideoEnabled, isCameraControlAllowed]);

  const shouldShowLoading = !isAppConfigLoaded || isWaitingPlayVideo;

  return (
    <Box
      className={classNames(
        'relative flex justify-center items-center',

        'sm:rounded-xl overflow-hidden bg-black',

        'aspect-video h-full min-h-[328px]'
      )}
    >
      <pre className="absolute left-3 top-3 z-50 w-96 text-white">
        {JSON.stringify({ isVideoEnabled, isAudioEnabled }, null, 2)}
      </pre>

      {shouldShowLoading && <VideoLoading />}

      {!shouldShowLoading && (
        <>
          <VignetteEffect />

          {!isVideoEnabled && (
            <Box className="relative h-2/5 aspect-square">
              <PreviewAvatar
                id="preview-avatar"
                initials={initials}
                username={user.defaultSettings.name}
                className="!h-full !w-full"
              />
            </Box>
          )}

          {isVideoEnabled && (
            <Box
              ref={containerRef}
              className={classNames('flex-1 w-full ', {
                hidden: isBackgroundEffectsOpen,
              })}
              data-video-container
            />
          )}

          <Stack
            direction="row"
            className={classNames(
              'absolute bottom-0 w-full items-center justify-between p-4 gap-4'
            )}
          >
            <div className="flex-1 flex items-start">
              {isAudioEnabled && <VoiceIndicatorIcon publisherAudioLevel={speechLevel} size={24} />}
            </div>

            <Stack direction="row" className="gap-4">
              <MicButton />
              <CameraButton />
            </Stack>

            <div className="flex-1 flex justify-end">
              {isVideoEnabled && (
                <>
                  <BackgroundEffectsButton onClick={() => setIsBackgroundEffectsOpen(true)} />
                  <BackgroundEffectsDialog
                    isBackgroundEffectsOpen={isBackgroundEffectsOpen}
                    setIsBackgroundEffectsOpen={setIsBackgroundEffectsOpen}
                  />
                </>
              )}
            </div>
          </Stack>
        </>
      )}
    </Box>
  );
};

export default VideoContainer;
