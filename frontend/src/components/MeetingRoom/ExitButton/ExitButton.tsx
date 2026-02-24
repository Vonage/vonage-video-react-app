import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../ToolbarButton';
import useRoomName from '../../../hooks/useRoomName';
import useTheme from '@ui/theme';
import VividIcon from '@components/VividIcon';

export type ExitButtonProps = {
  handleLeave: () => void;
};

/**
 * ExitButton Component
 *
 * This component provides a button for the user to exit the meeting.
 * @param {ExitButtonProps} props - the props for the component
 *  @property {() => void} handleLeave - a function that handles the leave action.
 * @returns {ReactElement} The exit button component
 */
const ExitButton = ({ handleLeave }: ExitButtonProps): ReactElement => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const roomName = useRoomName();
  const theme = useTheme();

  const handleExit = () => {
    handleLeave();
    navigate('/goodbye', { state: { roomName } });
  };

  return (
    <Tooltip title={t('room.exit.tooltip')} aria-label={t('room.exit.ariaLabel')}>
      <ToolbarButton
        onClick={handleExit}
        sx={{
          backgroundColor: theme.colors.error,
          '&:hover': {
            backgroundColor: theme.colors.errorHover,
          },
        }}
        icon={
          <VividIcon
            name="end-call-solid"
            customSize={-4}
            data-testid="CallEndIcon"
            sx={{ color: theme.colors.onSecondary }}
          />
        }
      />
    </Tooltip>
  );
};

export default ExitButton;
