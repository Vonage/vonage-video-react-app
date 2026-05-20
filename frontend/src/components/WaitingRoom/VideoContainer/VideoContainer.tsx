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
import AdvancedSettingsDialog from '@components/AdvancedSettings/Dialog';
import advancedSettings$ from '@Context/AdvancedSettings';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import PrecallNetworkTestDialog from '../PrecallNetworkTestDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import classNames from 'classnames';
import { env } from '../../../env';
import VideoStatsOverlay from '../VideoStatsOverlay';

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
  const isAdvancedSettingsOpen = advancedSettings$.use.select((state) => state.isOpen);
  const [{ isOpen: isBackgroundEffectsOpen }, { open, close }] = backgroundEffectsDialog$.use();
  const [{ isOpen: isPrecallNetworkTestOpen }, { close: closePrecallTest }] =
    precallNetworkTestDialog$.use();
  const { user } = useUserContext();
  const { publisherVideoElement, isVideoEnabled, isAudioEnabled, speechLevel, isVideoLoading } =
    usePreviewPublisherContext();
  const initials = getInitials(username);

  useEffect(() => {
    if (!publisherVideoElement) return;

    containerRef.current!.appendChild(publisherVideoElement);
  }, [publisherVideoElement]);

  return (
    <div
      className={classNames(
        'relative flex flex-col items-center justify-center',
        'aspect-video max-w-full',
        'bg-vera-surface',
        'rounded-vera-none sm:rounded-vera-large',
        '[-webkit-mask:linear-gradient(var(--vera-surface)_0_0)]',
        'box-border w-dvw sm:w-146 md:w-full'
      )}
    >
      <div
        ref={containerRef}
        className={classNames(
          'child:mx-auto',
          'child:animate-[fade-in_.6s_linear]',
          'child:-scale-x-100',
          'child:object-contain',
          'child:aspect-video',
          'child:w-dvw',
          'child:rounded-none',
          'md:child:w-146.25',
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

      {env.SHOW_VIDEO_STATS && isVideoEnabled && !isVideoLoading && (
        <div className="absolute left-4 top-3 z-10">
          <VideoStatsOverlay />
        </div>
      )}

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
          <div className="absolute right-5">
            <BackgroundEffectsButton onClick={open} />
            {isBackgroundEffectsOpen && (
              <BackgroundEffectsDialog
                isBackgroundEffectsOpen={true}
                setIsBackgroundEffectsOpen={close}
              />
            )}
            {isAdvancedSettingsOpen && <AdvancedSettingsDialog />}
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
