import { ReactElement, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MiniModeIcon from './MiniModeIcon';
import MiniCallWindowButton from './MiniCallWindowButton';
import AvatarInitials from '../../AvatarInitials';
import RecordingIndicator from '../RecordingIndicator';
import NameDisplay from '../NameDisplay';
import type {
  MiniModeHostedElement,
  MiniModeParticipant,
} from '../../../Context/MiniMode/MiniModeContext';

export type MiniCallWindowProps = {
  participant: MiniModeParticipant | null;
  hostedElement: MiniModeHostedElement;
  containerWidth: number;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHostedVideoEnabled: boolean;
  isRecording: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onExpand: () => void;
  onLeave: () => void;
};

/**
 * Simplified Mini Mode Picture-in-Picture window contents.
 * Shows active-speaker video (or avatar), name chip, and mute/camera/expand/leave controls.
 */
const MiniCallWindow = ({
  participant,
  hostedElement,
  containerWidth,
  isAudioEnabled,
  isVideoEnabled,
  isHostedVideoEnabled,
  isRecording,
  onToggleAudio,
  onToggleVideo,
  onExpand,
  onLeave,
}: MiniCallWindowProps): ReactElement => {
  const { t } = useTranslation();
  const videoHostRef = useRef<HTMLDivElement>(null);
  const showAvatar = !hostedElement || !isHostedVideoEnabled;
  const audioLabel = isAudioEnabled ? t('miniMode.mute.tooltip') : t('miniMode.unmute.tooltip');
  const videoLabel = isVideoEnabled
    ? t('miniMode.cameraOff.tooltip')
    : t('miniMode.cameraOn.tooltip');

  useLayoutEffect(() => {
    const host = videoHostRef.current;
    if (!host || !hostedElement) {
      return undefined;
    }

    host.appendChild(hostedElement);
    const videoElement = hostedElement;
    // eslint-disable-next-line react-hooks/immutability -- video element is a DOM node we own
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.objectFit = 'cover';
    videoElement.style.position = 'absolute';
    videoElement.style.inset = '0';

    return undefined;
  }, [hostedElement]);

  return (
    <div
      data-testid="mini-call-window"
      className="flex h-full w-full flex-col overflow-hidden bg-vera-dark-grey text-vera-on-secondary"
    >
      <div className="relative min-h-0 flex-1 bg-vera-dark-background">
        <div ref={videoHostRef} className="absolute inset-0 overflow-hidden" />
        {showAvatar && (
          <div className="absolute inset-0 flex items-center justify-center">
            <AvatarInitials
              initials={participant?.initials}
              username={participant?.name}
              height={160}
              width={160}
            />
          </div>
        )}
        {isRecording && (
          <div
            data-testid="mini-mode-recording-indicator"
            className="pointer-events-none absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-vera-dark-grey-opacity backdrop-blur-sm"
          >
            <RecordingIndicator isCompact />
          </div>
        )}
        {participant?.name && (
          <NameDisplay name={participant.name} containerWidth={containerWidth} />
        )}
      </div>
      <div className="flex items-center justify-center gap-2 px-3 py-2">
        <MiniCallWindowButton
          data-testid="mini-mode-mute"
          title={audioLabel}
          aria-label={audioLabel}
          onClick={onToggleAudio}
        >
          <MiniModeIcon
            name={isAudioEnabled ? 'microphone-solid' : 'mic-mute-solid'}
            className={isAudioEnabled ? 'text-vera-on-secondary-light' : 'text-vera-error'}
          />
        </MiniCallWindowButton>
        <MiniCallWindowButton
          data-testid="mini-mode-camera"
          title={videoLabel}
          aria-label={videoLabel}
          onClick={onToggleVideo}
        >
          <MiniModeIcon
            name={isVideoEnabled ? 'video-solid' : 'video-off-solid'}
            className={isVideoEnabled ? 'text-vera-on-secondary-light' : 'text-vera-error'}
          />
        </MiniCallWindowButton>
        <MiniCallWindowButton
          data-testid="mini-mode-expand"
          title={t('miniMode.expand.tooltip')}
          aria-label={t('miniMode.expand.ariaLabel')}
          onClick={onExpand}
        >
          <MiniModeIcon name="export-solid" className="rotate-180 text-vera-on-secondary-light" />
        </MiniCallWindowButton>
        <MiniCallWindowButton
          data-testid="mini-mode-leave"
          variant="danger"
          title={t('miniMode.leave.tooltip')}
          aria-label={t('miniMode.leave.ariaLabel')}
          onClick={onLeave}
        >
          <MiniModeIcon name="end-call-solid" className="text-vera-on-secondary-light" />
        </MiniCallWindowButton>
      </div>
    </div>
  );
};

export default MiniCallWindow;
