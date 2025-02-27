import Fade from '@mui/material/Fade';
import { useState, useEffect, ReactElement } from 'react';
import { Alert, Box } from '@mui/material';
import { MUTED_ALERT_MESSAGE, FORCE_MUTED_ALERT_MESSAGE } from '../../utils/constants';
import useSpeakingDetector from '../../hooks/useSpeakingDetector';
import usePublisherContext from '../../hooks/usePublisherContext';

/**
 * MutedAlert Component
 *
 * Displays a dismissible notification when the user is speaking while muted or has been muted by another participant.
 * @returns {ReactElement} - The MutedAlert component.
 */
const MutedAlert = (): ReactElement => {
  const { publisher, isAudioEnabled, isForceMuted } = usePublisherContext();
  const [open, setOpen] = useState<boolean>(true);
  const isSpeakingWhileMuted = useSpeakingDetector({
    isAudioEnabled,
    selectedMicrophoneId: publisher?.getAudioSource()?.id,
  });

  useEffect(() => {
    setOpen(isForceMuted || isSpeakingWhileMuted);
  }, [isForceMuted, isSpeakingWhileMuted]);

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: '96px',
        display: 'flex',
        left: '50%',
        transform: 'translate(-50%, 0%)',
        width: '100%',
        maxWidth: '320px',
      }}
    >
      <Fade in={open}>
        <Alert severity="warning" onClose={() => setOpen(false)}>
          {isForceMuted && <span>{FORCE_MUTED_ALERT_MESSAGE}</span>}
          {isSpeakingWhileMuted && !isForceMuted && <span>{MUTED_ALERT_MESSAGE}</span>}
        </Alert>
      </Fade>
    </Box>
  );
};

export default MutedAlert;
