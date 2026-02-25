import Button from '@mui/material/Button';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import VividIcon from '@components/VividIcon';

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
      startIcon={<VividIcon name="plus-line" customSize={-5} />}
      onClick={handleNewRoom}
      fullWidth
    >
      <Box>{t('button.createRoom')}</Box>
    </Button>
  );
};

export default NewRoomButton;
