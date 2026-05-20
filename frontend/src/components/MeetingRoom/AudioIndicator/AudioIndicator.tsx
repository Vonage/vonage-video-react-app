import { ReactElement, useState } from 'react';
import { Stream } from '@vonage/client-sdk-video';
import { useTranslation } from 'react-i18next';
import PopupDialog, { DialogTexts } from '../PopupDialog';
import VoiceIndicatorIcon from '../VoiceIndicator/VoiceIndicator';
import useSessionContext from '../../../hooks/useSessionContext';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@ui/VividIcon';
import Box from '@mui/material/Box';
export type AudioIndicatorProps = {
  hasAudio: boolean | undefined;
  indicatorStyle?: React.CSSProperties;
  indicatorColor?: string;
  indicatorClassName?: string;
  stream?: Stream;
  audioLevel?: number;
  participantName?: string;
};

/**
 * AudioIndicator Component
 *
 * This component displays an icon based on the audio status and handles muting another user.
 * @param {AudioIndicatorProps} hasAudio - Indicates whether the user has audio enabled.
 *  @property {boolean | undefined} audioLevel - (optional) Indicates the current audio level of the video tile.
 *  @property {React.CSSProperties} indicatorStyle - (optional) The MUI sx styling props for the component.
 *  @property {string} indicatorColor - (optional) The color of the audio indicator button.
 *  @property {Stream} stream - (optional) the stream that can be used to force mute a user.
 *  @property {string} participantName - (optional) the name of the participant that can be muted.
 * @returns {ReactElement} The audio indicator component.
 */
const AudioIndicator = ({
  hasAudio,
  indicatorStyle,
  indicatorColor,
  indicatorClassName,
  stream,
  audioLevel,
  participantName,
}: AudioIndicatorProps): ReactElement => {
  const { t } = useTranslation();
  const { forceMute } = useSessionContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const muteParticipantText: DialogTexts = {
    contents: t('participants.mute.dialog.content', { participantName }),
    primaryActionText: t('button.mute'),
    secondaryActionText: t('button.cancel'),
  };
  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleActionClick = () => {
    if (forceMute && stream) {
      void forceMute(stream);
      handleClose();
    }
  };

  const styles = {
    color: indicatorColor,
    cursor: hasAudio ? 'pointer' : 'default',
    transform: 'scale(0.8)',
  };

  if (audioLevel !== undefined) {
    return <VoiceIndicatorIcon publisherAudioLevel={audioLevel} size={24} />;
  }

  return (
    <Box className={indicatorClassName} style={indicatorStyle} data-testid="audio-indicator">
      <Tooltip title={hasAudio ? t('participants.mute.tooltip', { participantName }) : ''}>
        <IconButton
          disableRipple={!hasAudio}
          disableFocusRipple={!hasAudio}
          sx={{
            height: 24,
            width: 24,
            borderRadius: '50%',
            cursor: hasAudio ? 'pointer' : 'default',
          }}
          onClick={hasAudio ? handleClick : undefined}
        >
          {hasAudio ? (
            <VividIcon
              customSize={-5}
              name="microphone-2-solid"
              data-testid="MicIcon"
              style={styles}
            />
          ) : (
            <VividIcon
              customSize={-5}
              name="mic-mute-solid"
              style={{
                ...styles,
                color: 'var(--vera-error)',
                transform: 'scaleX(-1) scale(0.8)',
              }}
            />
          )}
        </IconButton>
      </Tooltip>
      <PopupDialog
        isOpen={isModalOpen}
        handleClose={handleClose}
        handleActionClick={handleActionClick}
        actionText={muteParticipantText}
      />
    </Box>
  );
};

export default AudioIndicator;
