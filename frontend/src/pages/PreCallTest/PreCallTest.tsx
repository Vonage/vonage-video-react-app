import { ReactElement, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Container, Typography } from '@mui/material';
import useNetworkTest from '../../hooks/useNetworkTest';
import TestError from '../../components/PreCall/TestError';
import QualityResults from '../../components/PreCall/QualityResults';
import TestProgress from '../../components/PreCall/TestProgress';
import TestControls from '../../components/PreCall/TestControls';
import useRoomName from '../../hooks/useRoomName';

export type PreCallTestProps = {
  onModalClose: () => void;
};

/**
 * PreCallTest Component
 *
 * Provides network testing interface for Vonage Video API connectivity and quality testing.
 * Always used in modal mode.
 * @param {PreCallTestProps} props - The props for the component.
 *  @property {() => void} onModalClose - Function to close the modal.
 * @returns {ReactElement} - The pre-call test component.
 */
const PreCallTest = ({ onModalClose }: PreCallTestProps): ReactElement => {
  const roomName = useRoomName();
  const { t } = useTranslation();
  const [isTestingStarted, setIsTestingStarted] = useState(false);
  const [isStoppedByUser, setIsStoppedByUser] = useState(false);

  const { state, testQuality, stopTest, clearResults } = useNetworkTest();

  // Cleanup: stop test when component unmounts (modal closes)
  useEffect(() => {
    return () => {
      stopTest();
    };
  }, [stopTest]);

  const handleStartQualityTest = useCallback(async () => {
    if (!roomName) {
      return;
    }

    try {
      await testQuality(roomName, { timeout: 15000 });
    } catch (error) {
      console.error('Quality test failed:', error);
    }
  }, [roomName, testQuality]);

  const handleStopTest = () => {
    stopTest();
    setIsTestingStarted(false);
    setIsStoppedByUser(true);
    onModalClose();
  };

  const handleClearResults = () => {
    clearResults();
    setIsTestingStarted(false);
    setIsStoppedByUser(false);
  };

  const handleContinueToWaitingRoom = useCallback(() => {
    onModalClose();
  }, [onModalClose]);

  useEffect(() => {
    if (
      roomName &&
      !isTestingStarted &&
      !state.isTestingQuality &&
      !state.qualityResults &&
      !isStoppedByUser
    ) {
      handleStartQualityTest();
    }
  }, [
    roomName,
    isTestingStarted,
    state.isTestingQuality,
    state.qualityResults,
    isStoppedByUser,
    handleStartQualityTest,
  ]);

  const hasResults = Boolean(state.qualityResults);
  const isTestingInProgress = state.qualityStats && state.isTestingQuality;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100%',
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: 'white',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          height: '100%',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          px: 2,
          py: 4,
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            {t('precallTest.title')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            {t('precallTest.subtitle')}
            <Typography component="span" sx={{ ml: 0.5, fontWeight: 'medium' }}>
              {roomName || t('precallTest.loading')}
            </Typography>
          </Typography>

          {state.error && <TestError error={state.error} />}

          {state.qualityResults && <QualityResults results={state.qualityResults} />}

          {isTestingInProgress && <TestProgress />}

          <TestControls
            isTestingQuality={state.isTestingQuality}
            hasResults={hasResults}
            onStopTest={handleStopTest}
            onClearResults={handleClearResults}
            onContinueToWaitingRoom={handleContinueToWaitingRoom}
          />

          {!isTestingStarted && !state.error && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                {t('precallTest.description')}
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default PreCallTest;
