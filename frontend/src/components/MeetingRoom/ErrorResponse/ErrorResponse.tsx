import { Snackbar, Alert } from '@mui/material';
import { Dispatch, ReactElement, SetStateAction } from 'react';
import { BACKEND_ERROR_DISPLAY_DURATION_MS } from '../../../utils/constants';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

export type ErrorResponseProps = {
  errorResponse: string | null;
  setErrorResponse: Dispatch<SetStateAction<string | null>>;
};

/**
 * ErrorResponse Component
 *
 * Displays an error message when there is an issue with a backend service.
 * @param {ErrorResponseProps} props - the props for the component
 *  @property {string | null} errorResponse - the error message to display
 *  @property {Dispatch<SetStateAction<string | null>>} setErrorResponse - function to set the error message to
 * @returns {ReactElement} - The ErrorResponse component.
 */
const ErrorResponse = ({ errorResponse, setErrorResponse }: ErrorResponseProps): ReactElement => {
  const isSmallViewport = useIsSmallViewport();
  return (
    <Snackbar
      open={!!errorResponse}
      autoHideDuration={BACKEND_ERROR_DISPLAY_DURATION_MS}
      onClose={() => setErrorResponse(null)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: isSmallViewport ? 10 : 6 }}
      data-testid="error-response"
    >
      <Alert
        onClose={() => setErrorResponse(null)}
        severity="error"
        sx={{ width: isSmallViewport ? '80%' : '100%' }}
      >
        {errorResponse}
      </Alert>
    </Snackbar>
  );
};

export default ErrorResponse;
