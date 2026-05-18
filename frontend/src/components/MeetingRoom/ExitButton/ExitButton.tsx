import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import ToolbarButton from '../ToolbarButton';
import useSessionContext from '@hooks/useSessionContext';
import VividIcon from '@ui/VividIcon';

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
  const { sessionKey } = useSessionContext();

  const isSessionReady = !!sessionKey;

  const handleExit = () => {
    handleLeave();
    navigate(`/goodbye/${sessionKey ?? ''}`);
  };

  return (
    <Tooltip title={t('room.exit.tooltip')} aria-label={t('room.exit.ariaLabel')}>
      <ToolbarButton
        disabled={!isSessionReady}
        onClick={handleExit}
        className="bg-vera-error! hover:bg-vera-error-hover!"
        icon={
          <VividIcon
            name="end-call-solid"
            customSize={-4}
            data-testid="CallEndIcon"
            style={{ color: 'var(--vera-on-secondary-light)' }}
          />
        }
      />
    </Tooltip>
  );
};

export default ExitButton;
