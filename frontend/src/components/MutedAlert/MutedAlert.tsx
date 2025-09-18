import Fade from '@mui/material/Fade';
import { useState, useEffect, ReactElement } from 'react';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import useSpeakingDetector from '../../hooks/useSpeakingDetector';
import usePublisherContext from '../../hooks/usePublisherContext';
import useIsSmallViewport from '../../hooks/useIsSmallViewport';

/**
 * MutedAlert Component
 *
 * Displays a dismissible notification when the user is speaking while muted or has been muted by another participant.
 * @returns {ReactElement} - The MutedAlert component.
 */
const MutedAlert = (): ReactElement => {
  const { t } = useTranslation();
  const { publisher, isAudioEnabled, isForceMuted } = usePublisherContext();
  const [open, setOpen] = useState<boolean>(false);
  const isSpeakingWhileMuted = useSpeakingDetector({
    isAudioEnabled,
    selectedMicrophoneId: publisher?.getAudioSource()?.id,
  });
  const isSmallViewport = useIsSmallViewport();
  const messageToDisplay = isForceMuted
    ? t('mutedAlert.message.forceMuted')
    : t('mutedAlert.message.muted');

  useEffect(() => {
    setOpen(isForceMuted || isSpeakingWhileMuted);
  }, [isForceMuted, isSpeakingWhileMuted]);

  return (
    <Fade in={open}>
      <Alert
        severity="warning"
        onClose={() => setOpen(false)}
        sx={{
          position: 'absolute',
          bottom: isSmallViewport ? '80px' : '96px',
          left: '50%',
          transform: 'translate(-50%, 0%)',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        {messageToDisplay}
      </Alert>
    </Fade>
  );
};

export default MutedAlert;
