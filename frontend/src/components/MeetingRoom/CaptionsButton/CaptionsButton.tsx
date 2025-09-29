import { ClosedCaption, ClosedCaptionDisabled } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { Dispatch, ReactElement, useState, SetStateAction } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import useRoomName from '../../../hooks/useRoomName';
import ToolbarButton from '../ToolbarButton';
import { disableCaptions, enableCaptions } from '../../../api/captions';

export type CaptionsState = {
  isUserCaptionsEnabled: boolean;
  setIsUserCaptionsEnabled: Dispatch<SetStateAction<boolean>>;
  setCaptionsErrorResponse: Dispatch<SetStateAction<string | null>>;
};

export type CaptionsButtonProps = {
  isOverflowButton?: boolean;
  handleClick?: () => void;
  captionsState: CaptionsState;
};

/**
 * CaptionsButton Component
 *
 * Displays a button and handles the captioning functionality.
 * @param {CaptionsButtonProps} props - the props for the component
 *  @property {boolean} isOverflowButton - (optional) whether the button is in the ToolbarOverflowMenu
 *  @property {(event?: MouseEvent | TouchEvent) => void} handleClick - (optional) click handler that closes the overflow menu in small viewports.
 *  @property {CaptionsState} captionsState - the state of the captions, including whether they are enabled and functions to set error messages
 * @returns {ReactElement} - The CaptionsButton component.
 */
const CaptionsButton = ({
  isOverflowButton = false,
  handleClick,
  captionsState,
}: CaptionsButtonProps): ReactElement => {
  const { t } = useTranslation();
  const roomName = useRoomName();
  const [captionsId, setCaptionsId] = useState<string>('');
  const { isUserCaptionsEnabled, setIsUserCaptionsEnabled, setCaptionsErrorResponse } =
    captionsState;
  const title = isUserCaptionsEnabled ? t('captions.disable') : t('captions.enable');

  const handleClose = () => {
    if (isOverflowButton && handleClick) {
      handleClick();
    }
  };

  const sessionCaptionsEnabled = !!roomName && !!captionsId;

  const handleCaptionsErrorResponse = (message: string | null) => {
    setCaptionsErrorResponse(message || t('errors.unknown'));
    setCaptionsId('');
    setIsUserCaptionsEnabled(false);
  };

  const handleCaptionsEnable = async () => {
    try {
      const response = await enableCaptions(roomName);
      setCaptionsId(response.data.captionsId);
      setIsUserCaptionsEnabled(true);
    } catch (error) {
      if (error instanceof AxiosError) {
        handleCaptionsErrorResponse(error.response?.data.message);
      }
    }
  };

  const handleCaptionsDisable = async () => {
    try {
      setCaptionsId('');
      await disableCaptions(roomName, captionsId);
      setIsUserCaptionsEnabled(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        handleCaptionsErrorResponse(error.response?.data.message);
      }
    }
  };

  const handleCaptions = async (action: 'enable' | 'disable') => {
    if (action === 'enable') {
      await handleCaptionsEnable();
    } else if (action === 'disable' && sessionCaptionsEnabled) {
      await handleCaptionsDisable();
    }
  };

  const handleActionClick = () => {
    handleCaptions(isUserCaptionsEnabled ? 'disable' : 'enable');
    handleClose();
  };

  return (
    <Tooltip title={title} aria-label={t('captions.ariaLabel')}>
      <ToolbarButton
        onClick={handleActionClick}
        data-testid="captions-button"
        icon={
          !isUserCaptionsEnabled ? (
            <ClosedCaption style={{ color: 'white' }} />
          ) : (
            <ClosedCaptionDisabled
              style={{
                color: 'rgb(239 68 68)',
              }}
            />
          )
        }
        sx={{
          marginTop: isOverflowButton ? '0px' : '4px',
        }}
        isOverflowButton={isOverflowButton}
      />
    </Tooltip>
  );
};
export default CaptionsButton;
