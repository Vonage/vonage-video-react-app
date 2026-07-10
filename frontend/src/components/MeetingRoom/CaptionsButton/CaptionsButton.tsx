import { Dispatch, ReactElement, SetStateAction, useCallback } from 'react';
import { AxiosError } from 'axios';
import { useTranslation } from 'react-i18next';
import useSessionContext from '@hooks/useSessionContext';
import ToolbarButton from '../ToolbarButton';
import Tooltip from '@mui/material/Tooltip';
import VividIcon from '@ui/VividIcon';
import { env } from '../../../env';
import { runtime$ } from '@core/stores';

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

const captionLanguageMap: Record<string, string> = {
  en: 'en-US',
  'en-US': 'en-US',
  'en-GB': 'en-GB',
  ja: 'ja-JP',
  'ja-JP': 'ja-JP',
  de: 'de-DE',
  'de-DE': 'de-DE',
  'de-AT': 'de-DE',
  'de-CH': 'de-DE',
  es: 'es-ES',
  'es-ES': 'es-ES',
  'es-MX': 'es-MX',
  it: 'it-IT',
  'it-IT': 'it-IT',
};

function getCaptionLanguageCode(lng: string): string {
  return captionLanguageMap[lng] ?? 'en-US';
}

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
  const videoClient = runtime$.useVideoClient();
  const { t, i18n } = useTranslation();
  const { sessionKey } = useSessionContext();
  const { isUserCaptionsEnabled, setIsUserCaptionsEnabled, setCaptionsErrorResponse } =
    captionsState;
  const title = isUserCaptionsEnabled ? t('captions.disable') : t('captions.enable');

  const handleClose = () => {
    if (isOverflowButton && handleClick) {
      handleClick();
    }
  };

  const handleCaptionsErrorResponse = useCallback(
    (message: string | null) => {
      setCaptionsErrorResponse(message || t('errors.unknown'));

      setIsUserCaptionsEnabled(false);
    },
    [setCaptionsErrorResponse, setIsUserCaptionsEnabled, t]
  );

  const handleCaptionsEnable = useCallback(async () => {
    try {
      const currentLanguage = i18n.language || 'en';
      const captionLanguage = getCaptionLanguageCode(currentLanguage);

      await videoClient.ensureCaptionsEnabled({
        sessionKey: sessionKey!,
        captionOptions: { languageCode: captionLanguage },
      });

      setIsUserCaptionsEnabled(true);
    } catch (error) {
      if (error instanceof AxiosError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        handleCaptionsErrorResponse(error.response?.data.message);
      }
    }
  }, [videoClient, sessionKey, i18n.language, handleCaptionsErrorResponse, setIsUserCaptionsEnabled]);

  const handleCaptionsDisable = useCallback(() => {
    try {
      setIsUserCaptionsEnabled(false);
    } catch (error) {
      if (error instanceof AxiosError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        handleCaptionsErrorResponse(error.response?.data.message);
      }
    }
  }, [handleCaptionsErrorResponse, setIsUserCaptionsEnabled]);

  const handleCaptions = useCallback(
    async (action: 'enable' | 'disable') => {
      if (action === 'enable') {
        await handleCaptionsEnable();
      } else if (action === 'disable') {
        handleCaptionsDisable();
      }
    },
    [handleCaptionsEnable, handleCaptionsDisable]
  );

  const handleActionClick = useCallback(() => {
    void handleCaptions(isUserCaptionsEnabled ? 'disable' : 'enable');
    handleClose();
  }, [handleCaptions, isUserCaptionsEnabled, handleClose]);

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
                style={{ color: 'var(--vera-on-secondary-light)' }}
              />
            ) : (
              <VividIcon
                name="closed-captioning-off-solid"
                customSize={-5}
                style={{ color: 'var(--vera-error)' }}
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
