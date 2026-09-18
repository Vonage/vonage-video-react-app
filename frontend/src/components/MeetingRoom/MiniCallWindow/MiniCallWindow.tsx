import { ReactElement, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@ui/components/VividIcon';
import AvatarInitials from '../../AvatarInitials';
import { moveNode } from '../../../utils/documentPictureInPicture';
import type { MiniModeParticipant } from '../../../Context/MiniMode/resolveMiniModeParticipant';

export type MiniCallWindowProps = {
  participant: MiniModeParticipant | null;
  hostedElement: HTMLVideoElement | HTMLObjectElement | null;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onExpand: () => void;
  onLeave: () => void;
};

/**
 * Contents of the Mini Mode Picture-in-Picture window: active-speaker video
 * (or avatar), name chip, and mute / camera / expand / leave controls.
 * @param {MiniCallWindowProps} props - Video host and control handlers
 * @returns {ReactElement} Mini Mode chrome
 */
const MiniCallWindow = ({
  participant,
  hostedElement,
  isAudioEnabled,
  isVideoEnabled,
  onToggleAudio,
  onToggleVideo,
  onExpand,
  onLeave,
}: MiniCallWindowProps): ReactElement => {
  const { t } = useTranslation();
  const videoHostRef = useRef<HTMLDivElement>(null);
  const showAvatar = !hostedElement || !isVideoEnabled;

  useLayoutEffect(() => {
    const host = videoHostRef.current;
    if (!host || !hostedElement) {
      return undefined;
    }

    moveNode(hostedElement, host);
    const videoEl = hostedElement;
    // eslint-disable-next-line react-hooks/immutability -- video element is a DOM node we own
    videoEl.style.width = '100%';
    videoEl.style.height = '100%';
    videoEl.style.objectFit = 'cover';
    videoEl.style.position = 'absolute';
    videoEl.style.inset = '0';

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
        <span className="absolute right-2 top-2 rounded-full bg-vera-dark-grey-opacity px-2 py-0.5 text-xs">
          {t('miniMode.badge')}
        </span>
        {participant?.name && (
          <span className="absolute bottom-2 left-2 rounded-full bg-vera-dark-grey-opacity px-2 py-0.5 text-xs">
            {participant.name}
          </span>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 px-3 py-2">
        <Tooltip title={isAudioEnabled ? t('miniMode.mute.tooltip') : t('miniMode.unmute.tooltip')}>
          <IconButton
            data-testid="mini-mode-mute"
            onClick={onToggleAudio}
            size="small"
            aria-label={isAudioEnabled ? t('miniMode.mute.tooltip') : t('miniMode.unmute.tooltip')}
            className="bg-vera-dark-background!"
          >
            <VividIcon
              name={isAudioEnabled ? 'microphone-solid' : 'mic-mute-solid'}
              customSize={-5}
              style={{
                color: isAudioEnabled ? 'var(--vera-on-secondary-light)' : 'var(--vera-error)',
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip
          title={isVideoEnabled ? t('miniMode.cameraOff.tooltip') : t('miniMode.cameraOn.tooltip')}
        >
          <IconButton
            data-testid="mini-mode-camera"
            onClick={onToggleVideo}
            size="small"
            aria-label={
              isVideoEnabled ? t('miniMode.cameraOff.tooltip') : t('miniMode.cameraOn.tooltip')
            }
            className="bg-vera-dark-background!"
          >
            <VividIcon
              name={isVideoEnabled ? 'video-solid' : 'video-off-solid'}
              customSize={-5}
              style={{
                color: isVideoEnabled ? 'var(--vera-on-secondary-light)' : 'var(--vera-error)',
              }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('miniMode.expand.tooltip')}>
          <IconButton
            data-testid="mini-mode-expand"
            onClick={onExpand}
            size="small"
            aria-label={t('miniMode.expand.ariaLabel')}
            className="bg-vera-primary!"
          >
            <VividIcon
              name="open-line"
              customSize={-5}
              style={{ color: 'var(--vera-on-primary)' }}
            />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('miniMode.leave.tooltip')}>
          <IconButton
            data-testid="mini-mode-leave"
            onClick={onLeave}
            size="small"
            aria-label={t('miniMode.leave.ariaLabel')}
            className="bg-vera-error!"
          >
            <VividIcon
              name="end-call-solid"
              customSize={-5}
              style={{ color: 'var(--vera-on-secondary-light)' }}
            />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
};

export default MiniCallWindow;
