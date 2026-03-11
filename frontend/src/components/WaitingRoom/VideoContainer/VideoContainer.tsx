import { useRef, useEffect, ReactElement } from 'react';
import { VIDEO_CONTAINER_HEIGHT_WR } from '@utils/constants';
import MicButton from '../MicButton';
import CameraButton from '../CameraButton';
import VideoLoading from '../VideoLoading';
import useUserContext from '../../../hooks/useUserContext';
import usePreviewPublisherContext from '../../../hooks/usePreviewPublisherContext';
import getInitials from '../../../utils/getInitials';
import PreviewAvatar from '../PreviewAvatar';
import VoiceIndicatorIcon from '../../MeetingRoom/VoiceIndicator/VoiceIndicator';
import VignetteEffect from '../VignetteEffect';
import BackgroundEffectsDialog from '../BackgroundEffects/BackgroundEffectsDialog';
import BackgroundEffectsButton from '../BackgroundEffects/BackgroundEffectsButton';
import MirrorSelfViewButton from '../MirrorSelfViewButton';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import PrecallNetworkTestDialog from '../PrecallNetworkTestDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import classNames from 'classnames';

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
  const [{ isOpen: isBackgroundEffectsOpen }, { open, close }] = backgroundEffectsDialog$.use();
  const [{ isOpen: isPrecallNetworkTestOpen }, { close: closePrecallTest }] =
    precallNetworkTestDialog$.use();
  const { user } = useUserContext();
  const { publisherVideoElement, isVideoEnabled, isAudioEnabled, speechLevel, isVideoLoading } =
    usePreviewPublisherContext();
  const initials = getInitials(username);
  const { mirrorSelfView } = user.defaultSettings;

  useEffect(() => {
    if (!publisherVideoElement) return;

    // Vonage/OT injects the video element with object-fit=contain by default, which leaves letterboxing
    // inside our 16:9 tile. We set cover here so the preview fills the tile consistently.
    // eslint-disable-next-line react-hooks/immutability
    publisherVideoElement.style.objectFit = 'cover';
    containerRef.current!.appendChild(publisherVideoElement);
  }, [publisherVideoElement]);

  useEffect(() => {
    if (!publisherVideoElement) return;

    const isSdkMirroring = publisherVideoElement.classList.contains('OT_mirrored');
    // The SDK mirrors the preview publisher via .OT_mirrored (scale(-1, 1) on .OT_video-element).
    // When mirror is ON, prefer the SDK class; fall back to an inline mirror if the class is absent.
    // When mirror is OFF, set scaleX(1) to override and cancel the SDK's mirror.
    if (mirrorSelfView) {
      if (isSdkMirroring) {
        publisherVideoElement.style.removeProperty('transform');
      } else {
        // eslint-disable-next-line react-hooks/immutability
        publisherVideoElement.style.transform = 'scaleX(-1)';
      }
    } else {
      // eslint-disable-next-line react-hooks/immutability
      publisherVideoElement.style.transform = 'scaleX(1)';
    }
  }, [publisherVideoElement, mirrorSelfView]);

  return (
    <div
      className={classNames(
        'relative flex flex-col items-center justify-center',
        'aspect-video max-w-full',
        'bg-vera-surface',
        'rounded-vera-none sm:rounded-vera-large',
        '[-webkit-mask:linear-gradient(var(--vera-surface)_0_0)]',
        'box-border w-dvw sm:w-[584px] md:w-full'
      )}
    >
      <div
        ref={containerRef}
        className={classNames(
          'child:mx-auto',
          'child:animate-[fade-in_.6s_linear]',
          'child:aspect-video',
          'child:w-dvw',
          'child:rounded-none',
          'md:child:w-[585px]',
          `child:md:h-[${VIDEO_CONTAINER_HEIGHT_WR}px]`,
          'md:child:rounded-vera-large',
          'bg-vera-secondary',

          {
            hidden: isBackgroundEffectsOpen,
          }
        )}
        data-video-container
      ></div>

      <VignetteEffect />

      {isVideoLoading && <VideoLoading className="animate-fade-in" />}

      <PreviewAvatar
        initials={initials}
        username={user.defaultSettings.name}
        isVideoEnabled={isVideoEnabled}
        isVideoLoading={isVideoLoading}
      />

      {!isVideoLoading && (
        <div className="absolute inset-x-0 bottom-[5%] flex h-fit items-center justify-center animate-fade-in">
          {isAudioEnabled && (
            <div className="absolute left-4 top-3">
              <VoiceIndicatorIcon publisherAudioLevel={speechLevel} size={24} />
            </div>
          )}
          <div className="flex flex-row gap-1.5">
            <MicButton />
            <CameraButton />
          </div>
          <div className="absolute right-5 flex flex-row gap-2">
            <MirrorSelfViewButton />
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
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoContainer;
