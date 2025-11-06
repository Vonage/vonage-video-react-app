import { ReactElement } from 'react';
import { Button, Stack } from '@mui/material';
import { Stop, Clear, ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export type TestControlsProps = {
  isTestingQuality: boolean;
  hasResults: boolean;
  onStopTest: () => void;
  onRetryTest: () => void;
  onContinueToWaitingRoom: () => void;
};

const buttonStyles = {
  textTransform: 'none' as const,
  fontSize: '1rem',
  height: '56px',
  minWidth: '200px',
};

/**
 * TestControls Component
 *
 * This component renders the controls for stopping and managing network tests.
 * Tests start automatically when the modal opens.
 * @param {TestControlsProps} props - The props for the component.
 *  @property {boolean} isTestingQuality - Indicates if the quality test is running.
 *  @property {boolean} hasResults - Indicates if there are results available from previous tests.
 *  @property {() => void} onStopTest - Function to stop the current test.
 *  @property {() => void} onRetryTest - Function to clear all test results.
 *  @property {() => void} onContinueToWaitingRoom - Function to continue to the waiting room.
 * @returns {ReactElement} - The test controls component.
 */
const TestControls = ({
  isTestingQuality,
  hasResults,
  onStopTest,
  onRetryTest,
  onContinueToWaitingRoom,
}: TestControlsProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <Stack spacing={2} alignItems="center">
      {isTestingQuality && !hasResults && (
        <Button
          variant="contained"
          color="error"
          startIcon={<Stop />}
          onClick={onStopTest}
          sx={buttonStyles}
        >
          {t('precallTest.stopTest')}
        </Button>
      )}

      {hasResults && (
        <Stack
          spacing={2}
          alignItems="center"
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="center"
        >
          <Button variant="outlined" startIcon={<Clear />} onClick={onRetryTest} sx={buttonStyles}>
            {t('precallTest.retryTest')}
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<ArrowForward />}
            onClick={onContinueToWaitingRoom}
            sx={buttonStyles}
          >
            {t('precallTest.continueToWaitingRoom')}
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default TestControls;
