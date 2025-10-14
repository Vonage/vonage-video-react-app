import { ReactElement } from 'react';
import { Button } from '@mui/material';
import { NetworkCheck, VideoCall, Stop, Clear, ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export type TestControlsProps = {
  roomName: string | null;
  isTestingStarted: boolean;
  isTestingConnectivity: boolean;
  isTestingQuality: boolean;
  hasResults: boolean;
  onStartConnectivityTest: () => void;
  onStartQualityTest: () => void;
  onStopTest: () => void;
  onClearResults: () => void;
  onContinueToCall: () => void;
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
 * This component renders the controls for starting, stopping, and managing network tests.
 * @param {TestControlsProps} props - The props for the component.
 *  @property {string | null} roomName - The name of the room to join.
 *  @property {boolean} isTestingStarted - Indicates if any test is currently running.
 *  @property {boolean} isTestingConnectivity - Indicates if the connectivity test is running.
 *  @property {boolean} isTestingQuality - Indicates if the quality test is running.
 *  @property {boolean} hasResults - Indicates if there are results available from previous tests.
 *  @property {() => void} onStartConnectivityTest - Method to start the connectivity test.
 *  @property {() => void} onStartQualityTest - Method to start the quality test.
 *  @property {() => void} onStopTest - Method to stop the current test.
 *  @property {() => void} onClearResults - Method to clear the test results.
 *  @property {() => void} onContinueToCall - Method to continue to the call after tests.
 * @returns {ReactElement} The test controls component.
 */
const TestControls = ({
  roomName,
  isTestingStarted,
  isTestingConnectivity,
  isTestingQuality,
  hasResults,
  onStartConnectivityTest,
  onStartQualityTest,
  onStopTest,
  onClearResults,
  onContinueToCall,
}: TestControlsProps): ReactElement => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center space-y-4">
      {!isTestingStarted && !isTestingConnectivity && !isTestingQuality && !hasResults && (
        <>
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
            <Button
              variant="contained"
              startIcon={<NetworkCheck />}
              onClick={onStartConnectivityTest}
              disabled={!roomName}
              sx={buttonStyles}
            >
              {t('precallTest.testConnectivity')}
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<VideoCall />}
              onClick={onStartQualityTest}
              disabled={!roomName}
              sx={buttonStyles}
            >
              {t('precallTest.testQuality')}
            </Button>
          </div>

          <div className="mt-4">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowForward />}
              onClick={onContinueToCall}
              disabled={!roomName}
              sx={buttonStyles}
            >
              {t('precallTest.skipTest')}
            </Button>
          </div>
        </>
      )}

      {(isTestingConnectivity || isTestingQuality) && (
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
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={onClearResults}
            sx={buttonStyles}
          >
            {t('precallTest.clearResults')}
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<ArrowForward />}
            onClick={onContinueToCall}
            sx={buttonStyles}
          >
            {t('precallTest.continueToCall')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default TestControls;
