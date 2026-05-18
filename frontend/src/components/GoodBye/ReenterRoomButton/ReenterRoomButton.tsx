import VividIcon from '@ui/VividIcon';
import useSessionKeyParam from '@hooks/useSessionKeyParam';
import Button from '@mui/material/Button';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

/**
 * ReenterRoomButton Component
 *
 * This component returns a button that takes a user back to the meeting.
 * @returns {ReactElement} - the re-enter room button or an empty string if the room does not exist.
 */
const ReenterRoomButton = (): ReactElement | string => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { sessionKey } = useSessionKeyParam();

  const handleReenter = () => {
    navigate(`/waiting-room/${sessionKey}`);
  };
  return (
    sessionKey && (
      <Button
        startIcon={
          <VividIcon
            name="enter-line"
            customSize={-5}
            style={{ color: 'var(--vera-on-primary)' }}
          />
        }
        variant="contained"
        data-testid="reenterButton"
        onClick={handleReenter}
        fullWidth
      >
        {t('goodBye.reEnter')}
      </Button>
    )
  );
};

export default ReenterRoomButton;
