import { Button } from '@mui/material';
import { VideoCall } from '@mui/icons-material';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export type NewRoomButtonProps = {
  handleNewRoom: () => void;
};

/**
 * NewRoomButton Component
 *
 * This component renders a button to create a new room.
 * @param {NewRoomButtonProps} props - the props for the component.
 *  @property {() => void} handleNewRoom - method that handles the action when user click the 'create room' button.
 * @returns {ReactElement} The new room button component.
 */
const NewRoomButton = ({ handleNewRoom }: NewRoomButtonProps): ReactElement => {
  const { t } = useTranslation();
  return (
    <Button
      data-testid="new-room-button"
      variant="contained"
      className="mt-2 h-14"
      startIcon={<VideoCall />}
      onClick={handleNewRoom}
      fullWidth
      sx={{
        textTransform: 'none',
        marginBottom: '35px',
        fontSize: '1rem',
        justifyContent: 'space-between',
        width: '18rem',
      }}
    >
      <div className="flex w-full items-center justify-center text-center">
        {t('button.createRoom')}
      </div>
    </Button>
  );
};

export default NewRoomButton;
