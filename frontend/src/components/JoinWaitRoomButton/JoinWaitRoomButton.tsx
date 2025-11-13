import Button from '@ui/Button';
import { Dispatch, MouseEvent, ReactElement, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export type JoinWaitRoomButtonProps = {
  roomName: string;
  isDisabled: boolean;
  setHasError: Dispatch<SetStateAction<boolean>>;
};

/**
 * JoinWaitRoomButton Component
 *
 * This component returns a button that takes a user to the meeting.
 * @param {JoinWaitRoomButtonProps} props - the props for this component.
 *  @property {string} roomName - the name of the room to join.
 * @property {boolean} isDisabled - whether the button is disabled.
 * @property {Dispatch<SetStateAction<boolean>>} setHasError - function to set the error state.
 * @returns {ReactElement} - the join room button.
 */
const JoinWaitRoomButton = ({
  roomName,
  isDisabled,
  setHasError,
}: JoinWaitRoomButtonProps): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleJoin = (event: MouseEvent) => {
    event.preventDefault();
    if (roomName === '') {
      setHasError(true);
      return;
    }
    navigate(`/waiting-room/${roomName}`);
  };

  return (
    <Button
      variant="outlined"
      disabled={isDisabled}
      sx={{ ml: 1 }}
      onClick={handleJoin}
      type="submit"
    >
      {t('button.joinWaitingRoom')}
    </Button>
  );
};

export default JoinWaitRoomButton;
