import VividIcon from '@components/VividIcon';
import Button from '@mui/material/Button';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export type ReenterRoomButtonProps = {
  roomName: string;
};

/**
 * ReenterRoomButton Component
 *
 * This component returns a button that takes a user back to the meeting.
 * @param {ReenterRoomButtonProps} props - the props for this component.
 *  @property {string} roomName - the name of the room to rejoin.
 * @returns {ReactElement} - the re-enter room button or an empty string if the room does not exist.
 */
const ReenterRoomButton = ({ roomName }: ReenterRoomButtonProps): ReactElement | string => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleReenter = () => {
    navigate(`/waiting-room/${roomName}`);
  };
  return (
    roomName && (
      <Button
        startIcon={<VividIcon name="enter-line" customSize={-5} />}
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
