import VividIcon from '@ui/components/VividIcon';
import useSessionKeyParam from '@hooks/useSessionKeyParam';
import Button from '@mui/material/Button';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * ReenterRoomButton Component
 *
 * This component returns a button that takes a user back to the meeting.
 * @returns {ReactElement} - the re-enter room button.
 */
const ReenterRoomButton = (): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sessionKey } = useSessionKeyParam();

  const handleReenter = () => {
    void navigate(`/waiting-room/${sessionKey}`);
  };

  return (
    <Button
      startIcon={
        <VividIcon name="enter-line" customSize={-5} style={{ color: 'var(--vera-on-primary)' }} />
      }
      variant="contained"
      data-testid="reenterButton"
      onClick={handleReenter}
      fullWidth
    >
      {t('goodBye.reEnter')}
    </Button>
  );
};

export default ReenterRoomButton;
