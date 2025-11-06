import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertTitle } from '@mui/material';
import { ErrorNames } from '../../../hooks/useNetworkTest';

export type TestErrorProps = {
  error: { name: string; message: string };
};

const getErrorMessage = (error: { name: string; message: string }, t: (key: string) => string) => {
  switch (error.name) {
    case ErrorNames.FAILED_TO_OBTAIN_MEDIA_DEVICES:
      return t('precallTest.errors.mediaDevicesAccess');
    case ErrorNames.NO_AUDIO_CAPTURE_DEVICES:
      return t('precallTest.errors.noMicrophone');
    case ErrorNames.NO_VIDEO_CAPTURE_DEVICES:
      return t('precallTest.errors.noCamera');
    case ErrorNames.UNSUPPORTED_BROWSER:
      return t('precallTest.errors.unsupportedBrowser');
    case ErrorNames.CONNECT_TO_SESSION_NETWORK_ERROR:
      return t('precallTest.errors.networkConnection');
    default:
      return error.message || t('precallTest.errors.unexpected');
  }
};

/**
 * TestError Component
 *
 * This component displays an error message for the network test.
 * @param {TestErrorProps} props - The props for the component.
 * @property {{ name: string; message: string }} error - The error object containing the error name and message.
 * @returns {ReactElement} The test error component.
 */
const TestError = ({ error }: TestErrorProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <Alert severity="error" className="mb-6">
      <AlertTitle>{t('precallTest.testError')}</AlertTitle>
      {getErrorMessage(error, t)}
    </Alert>
  );
};

export default TestError;
