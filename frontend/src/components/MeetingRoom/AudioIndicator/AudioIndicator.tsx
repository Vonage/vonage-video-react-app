import { MicOff, Mic } from '@mui/icons-material';
import { ReactElement, useState } from 'react';
import { Stream } from '@vonage/client-sdk-video';
import Tooltip from '@mui/material/Tooltip';
import { IconButton } from '@mui/material';
import PopupDialog, { DialogTexts } from '../PopupDialog';
import VoiceIndicatorIcon from '../VoiceIndicator/VoiceIndicator';
import useSessionContext from '../../../hooks/useSessionContext';

export type AudioIndicatorProps = {
  hasAudio: boolean | undefined;
  indicatorStyle?: string;
  indicatorColor?: string;
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
 *  @property {string} indicatorStyle - (optional) The styling props for the component.
 *  @property {string} indicatorColor - (optional) The color of the audio indicator button.
 *  @property {Stream} stream - (optional) the stream that can be used to force mute a user.
 *  @property {string} participantName - (optional) the name of the participant that can be muted.
 * @returns {ReactElement} The audio indicator component.
 */
const AudioIndicator = ({
  hasAudio,
  indicatorStyle,
  indicatorColor,
  stream,
  audioLevel,
  participantName,
}: AudioIndicatorProps): ReactElement => {
  const { forceMute } = useSessionContext();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const muteParticipantText: DialogTexts = {
    contents: `Mute ${participantName} for everyone in the call? Only ${participantName} can unmute themselves.`,
    primaryActionText: 'Mute',
    secondaryActionText: 'Cancel',
  };
  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
  };

  const handleActionClick = () => {
    if (forceMute && stream) {
      forceMute(stream);
      handleClose();
    }
  };

  const sxProperties = {
    fontSize: '18px',
    color: indicatorColor,
    cursor: hasAudio ? 'pointer' : 'default',
  };

  if (audioLevel !== undefined) {
    return <VoiceIndicatorIcon publisherAudioLevel={audioLevel} size={20} />;
  }

  return (
    <div className={indicatorStyle} data-testid="audio-indicator">
      <Tooltip title={hasAudio ? `Mute ${participantName}'s microphone` : ''}>
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
          {hasAudio ? <Mic sx={sxProperties} /> : <MicOff sx={sxProperties} />}
        </IconButton>
      </Tooltip>
      <PopupDialog
        isOpen={isModalOpen}
        handleClose={handleClose}
        handleActionClick={handleActionClick}
        actionText={muteParticipantText}
      />
    </div>
  );
};

export default AudioIndicator;
