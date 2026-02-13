import { Dispatch, ReactElement, useState, SetStateAction } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import appConfig$ from '@stores/appConfig';
import { enableCaptions } from '@api/captions';
import useRoomName from '@hooks/useRoomName';
import ToolbarButton from '../ToolbarButton';
import Tooltip from '@ui/Tooltip';
import VividIcon from '@components/VividIcon';
import useTheme from '@ui/theme';

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
  const isMeetingCaptionsAllowed = appConfig$.useIsMeetingCaptionsAllowed();

  const { t } = useTranslation();
  const roomName = useRoomName();
  const [captionsEnabled, setCaptionsEnabled] = useState<boolean>(false);
  const { isUserCaptionsEnabled, setIsUserCaptionsEnabled, setCaptionsErrorResponse } =
    captionsState;
  const title = isUserCaptionsEnabled ? t('captions.disable') : t('captions.enable');
  const theme = useTheme();

  const handleClose = () => {
    if (isOverflowButton && handleClick) {
      handleClick();
    }
  };

  const sessionCaptionsEnabled = !!roomName && captionsEnabled;

  const handleCaptionsErrorResponse = (message: string | null) => {
    setCaptionsErrorResponse(message || t('errors.unknown'));
    setCaptionsEnabled(false);
    setIsUserCaptionsEnabled(false);
  };

  const handleCaptionsEnable = async () => {
    try {
      await enableCaptions(roomName);
      setCaptionsEnabled(true);
      setIsUserCaptionsEnabled(true);
    } catch (error) {
      if (error instanceof AxiosError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        handleCaptionsErrorResponse(error.response?.data.message);
      }
    }
  };

  const handleCaptionsDisable = () => {
    try {
      setCaptionsEnabled(false);
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
      handleCaptionsDisable();
    }
  };

  const handleActionClick = () => {
    handleCaptions(isUserCaptionsEnabled ? 'disable' : 'enable');
    handleClose();
  };

  return (
    isMeetingCaptionsAllowed && (
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
