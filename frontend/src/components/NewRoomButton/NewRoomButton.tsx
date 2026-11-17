import Button from '@mui/material/Button';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import VividIcon from '@ui/components/VividIcon';
import { testIds } from './testIds';

export { testIds } from './testIds';

export type NewRoomButtonProps = {
  handleNewRoom: () => void;
  isDisabled?: boolean;
};

/**
 * NewRoomButton Component
 *
 * This component renders a button to create a new room.
 * @param {NewRoomButtonProps} props - the props for the component.
 *  @property {() => void} handleNewRoom - method that handles the action when user click the 'create room' button.
 * @returns {ReactElement} The new room button component.
 */
const NewRoomButton = ({ handleNewRoom, isDisabled }: NewRoomButtonProps): ReactElement => {
  const { t } = useTranslation();
  return (
    <Button
      data-testid={testIds.button}
      variant="contained"
      startIcon={
        <VividIcon name="plus-line" customSize={-5} style={{ color: 'var(--vera-on-primary)' }} />
      }
      onClick={handleNewRoom}
      disabled={isDisabled}
      fullWidth
    >
      <Box>{t('button.createRoom')}</Box>
    </Button>
  );
};

export default NewRoomButton;
