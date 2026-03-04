import { Dispatch, ReactElement, useState, SetStateAction } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import { disableCaptions, enableCaptions } from '@api/captions';
import useRoomName from '@hooks/useRoomName';
import ToolbarButton from '../ToolbarButton';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@components/VividIcon';
import useTheme from '@ui/theme';
import { env } from '../../../env';

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
 * @returns {ReactElement | false} - The CaptionsButton component.
 */
const CaptionsButton = ({
  isOverflowButton = false,
  handleClick,
  captionsState,
}: CaptionsButtonProps): ReactElement | false => {
  const { t } = useTranslation();
  const roomName = useRoomName();
  const [captionsId, setCaptionsId] = useState<string>('');
  const { isUserCaptionsEnabled, setIsUserCaptionsEnabled, setCaptionsErrorResponse } =
    captionsState;
  const title = isUserCaptionsEnabled ? t('captions.disable') : t('captions.enable');
  const theme = useTheme();

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
    void handleCaptions(isUserCaptionsEnabled ? 'disable' : 'enable');
    handleClose();
  };

  return (
    env.ALLOW_CAPTIONS && (
      <Tooltip title={title} aria-label={t('captions.ariaLabel')}>
        <ToolbarButton
          onClick={handleActionClick}
          data-testid="captions-button"
          icon={
            !isUserCaptionsEnabled ? (
              <VividIcon
                name="closed-captioning-solid"
                customSize={-5}
                sx={{ color: theme.colors.onSecondary }}
              />
            ) : (
              <VividIcon
                name="closed-captioning-off-solid"
                customSize={-5}
                sx={{ color: theme.colors.error }}
              />
            )
          }
          sx={{
            marginTop: isOverflowButton ? '0px' : '4px',
          }}
          isOverflowButton={isOverflowButton}
        />
      </Tooltip>
    )
  );
};
export default CaptionsButton;
