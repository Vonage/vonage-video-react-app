import { Button } from '@mui/material';
import { MouseEvent, ReactElement, TouchEvent } from 'react';
import { useTranslation } from 'react-i18next';

export type ReenterRoomButtonProps = {
  handleReenter: (event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => void;
  roomName: string;
};

/**
 * ReenterRoomButton Component
 *
 * This component returns a button that takes a user back to the meeting.
 * @param {ReenterRoomButtonProps} props - the props for this component.
 *  @property {Function} handleReenter - the function that handles the action of re-entering.
 *  @property {string} roomName - the name of the room to rejoin.
 * @returns {ReactElement} - the re-enter room button or an empty string if the room does not exist.
 */
const ReenterRoomButton = ({
  handleReenter,
  roomName,
}: ReenterRoomButtonProps): ReactElement | string => {
  const { t } = useTranslation();

  return (
    roomName && (
      <Button
        variant="outlined"
        className="h-12"
        data-testid="reenterButton"
        sx={{
          textTransform: 'none',
          fontSize: '1rem',
          marginRight: '8px',
          marginBottom: '16px',
        }}
        onClick={handleReenter}
      >
        {t('goodBye.reEnter')}
      </Button>
    )
  );
};

export default ReenterRoomButton;
