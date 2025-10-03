import { Snackbar, Alert } from '@mui/material';
import { Dispatch, ReactElement, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { CAPTION_ERROR_DISPLAY_DURATION_MS } from '../../../utils/constants';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type CaptionsErrorProps = {
  captionsErrorResponse: string | null;
  setCaptionsErrorResponse: Dispatch<SetStateAction<string | null>>;
};

/**
 * CaptionsError Component
 *
 * Displays an error message when there is an issue with the captions service.
 * @param {CaptionsErrorProps} props - the props for the component
 *  @property {string | null} captionsErrorResponse - the error message to display
 *  @property {Dispatch<SetStateAction<string | null>>} setCaptionsErrorResponse - function to set the error message to null when the snackbar is closed
 * @returns {ReactElement} - The CaptionsError component.
 */
const CaptionsError = ({
  captionsErrorResponse,
  setCaptionsErrorResponse,
}: CaptionsErrorProps): ReactElement => {
  const { t } = useTranslation();
  const isSmallViewport = useIsSmallViewport();
  return (
    <Snackbar
      open={!!captionsErrorResponse}
      autoHideDuration={CAPTION_ERROR_DISPLAY_DURATION_MS}
      onClose={() => setCaptionsErrorResponse(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: isSmallViewport ? 10 : 6 }}
      data-testid="captions-error"
    >
      <Alert
        onClose={() => setCaptionsErrorResponse(null)}
        severity="error"
        sx={{ width: isSmallViewport ? '80%' : '100%' }}
      >
        {t('captions.errors', { captionsErrorResponse })}
      </Alert>
    </Snackbar>
  );
};

export default CaptionsError;
