import Button from '@mui/material/Button';
import { Dispatch, MouseEvent, ReactElement, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isNil } from '@common/assertions';
import parseRoomIdInput from './helpers/parseRoomIdInput';

export type JoinWaitRoomButtonProps = {
  roomId: string;
  isDisabled: boolean;
  setHasError: Dispatch<SetStateAction<boolean>>;
};

/**
 * JoinWaitRoomButton Component
 *
 * This component returns a button that takes a user to the meeting.
 * @param {JoinWaitRoomButtonProps} props - the props for this component.
 *  @property {string} roomId - the sessionKey or room name typed by the user.
 * @property {boolean} isDisabled - whether the button is disabled.
 * @property {Dispatch<SetStateAction<boolean>>} setHasError - function to set the error state.
 * @returns {ReactElement} - the join room button.
 */
const JoinWaitRoomButton = ({
  roomId,
  isDisabled,
  setHasError,
}: JoinWaitRoomButtonProps): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleJoin = (event: MouseEvent) => {
    event.preventDefault();
    const roomIdentifier = parseRoomIdInput(roomId);
    if (isNil(roomIdentifier)) {
      setHasError(true);
      return;
    }

    void navigate(`/waiting-room/${roomIdentifier}`);
  };

  return (
    <Button variant="outlined" disabled={isDisabled} onClick={handleJoin} type="submit">
      {t('button.joinWaitingRoom')}
    </Button>
  );
};

export default JoinWaitRoomButton;
