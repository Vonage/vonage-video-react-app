import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { env } from '../../../env';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import screenShare$ from '@Context/screenShare';

/**
 * ScreenShareError Component
 *
 * Displays an error message when screen sharing fails to publish.
 * @returns {ReactElement} - The ScreenShareError component.
 */
const ScreenShareError = (): ReactElement => {
  const { t } = useTranslation();
  const isSmallViewport = useIsSmallViewport();
  const shareScreenError = screenShare$.useShareScreenError();
  const { clearShareScreenError } = screenShare$.use.actions();

  return (
    <Snackbar
      open={!!shareScreenError}
      autoHideDuration={env.NOTIFICATION_DURATION_MS}
      onClose={clearShareScreenError}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: isSmallViewport ? 10 : 6 }}
      data-testid="screen-share-error"
      className="bg-vera-surface!"
    >
      <Alert
        onClose={clearShareScreenError}
        severity="error"
        className="bg-vera-alert-background text-vera-alert-text"
        sx={{ width: isSmallViewport ? '80%' : '100%' }}
      >
        {t('screenSharing.errors', { shareScreenError })}
      </Alert>
    </Snackbar>
  );
};

export default ScreenShareError;
