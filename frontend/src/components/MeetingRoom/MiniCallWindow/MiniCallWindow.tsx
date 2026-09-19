import { ReactElement, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import MiniModeIcon from './MiniModeIcon';
import AvatarInitials from '../../AvatarInitials';
import { moveNode } from '@common/documentPictureInPicture';
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

type MiniModeButtonConfig = {
  testId: string;
  tooltip: string;
  ariaLabel: string;
  iconName: string;
  iconColor: string;
  iconClassName?: string;
  buttonClassName: string;
  onClick: () => void;
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
    const videoElement = hostedElement;
    // eslint-disable-next-line react-hooks/immutability -- video element is a DOM node we own
    videoElement.style.width = '100%';
    videoElement.style.height = '100%';
    videoElement.style.objectFit = 'cover';
    videoElement.style.position = 'absolute';
    videoElement.style.inset = '0';

    return undefined;
  }, [hostedElement]);

  const buttons: MiniModeButtonConfig[] = [
    {
      testId: 'mini-mode-mute',
      tooltip: isAudioEnabled ? t('miniMode.mute.tooltip') : t('miniMode.unmute.tooltip'),
      ariaLabel: isAudioEnabled ? t('miniMode.mute.tooltip') : t('miniMode.unmute.tooltip'),
      iconName: isAudioEnabled ? 'microphone-solid' : 'mic-mute-solid',
      iconColor: isAudioEnabled ? 'var(--vera-on-secondary-light)' : 'var(--vera-error)',
      buttonClassName: 'bg-vera-dark-background! rounded-full overflow-hidden',
      onClick: onToggleAudio,
    },
    {
      testId: 'mini-mode-camera',
      tooltip: isVideoEnabled ? t('miniMode.cameraOff.tooltip') : t('miniMode.cameraOn.tooltip'),
      ariaLabel: isVideoEnabled ? t('miniMode.cameraOff.tooltip') : t('miniMode.cameraOn.tooltip'),
      iconName: isVideoEnabled ? 'video-solid' : 'video-off-solid',
      iconColor: isVideoEnabled ? 'var(--vera-on-secondary-light)' : 'var(--vera-error)',
      buttonClassName: 'bg-vera-dark-background! rounded-full overflow-hidden',
      onClick: onToggleVideo,
    },
    {
      testId: 'mini-mode-expand',
      tooltip: t('miniMode.expand.tooltip'),
      ariaLabel: t('miniMode.expand.ariaLabel'),
      iconName: 'export-solid',
      iconColor: 'var(--vera-on-secondary-light)',
      iconClassName: 'rotate-180',
      buttonClassName: 'bg-vera-dark-background! rounded-full overflow-hidden',
      onClick: onExpand,
    },
    {
      testId: 'mini-mode-leave',
      tooltip: t('miniMode.leave.tooltip'),
      ariaLabel: t('miniMode.leave.ariaLabel'),
      iconName: 'end-call-solid',
      iconColor: 'var(--vera-on-secondary-light)',
      buttonClassName: 'bg-vera-error! rounded-full overflow-hidden',
      onClick: onLeave,
    },
  ];

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
        {participant?.name && (
          <span className="absolute bottom-2 left-2 rounded-full bg-vera-dark-grey-opacity px-2 py-0.5 text-xs">
            {participant.name}
          </span>
        )}
      </div>
      <div className="flex items-center justify-center gap-2 px-3 py-2">
        {buttons.map(
          ({
            testId,
            tooltip,
            ariaLabel,
            iconName,
            iconColor,
            iconClassName,
            buttonClassName,
            onClick,
          }) => (
            <Tooltip key={testId} title={tooltip}>
              <IconButton
                data-testid={testId}
                onClick={onClick}
                aria-label={ariaLabel}
                className={buttonClassName}
                /* Inline styles ensure the button stays a perfect 32×32 circle
                   even when Tailwind/MUI CSS hasn't finished loading in the
                   PiP document. size="small" only sets padding/min-width,
                   leaving height content-driven (28px) → oval. */
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '9999px',
                  boxSizing: 'border-box',
                  padding: 4,
                }}
              >
                <MiniModeIcon name={iconName} color={iconColor} className={iconClassName} />
              </IconButton>
            </Tooltip>
          )
        )}
      </div>
    </div>
  );
};

export default MiniCallWindow;
