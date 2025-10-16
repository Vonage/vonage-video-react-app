import { ReactElement, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
    <div className="flex size-full flex-col justify-between bg-white">
      <div className="flex size-full flex-col items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">{t('precallTest.title')}</h1>
          <p className="mb-8 text-gray-600">
            {t('precallTest.subtitle')}{' '}
            <span className="font-medium">{roomName || t('precallTest.loading')}</span>
          </p>

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
            <div className="mt-8">
              <p className="text-sm text-gray-500">{t('precallTest.description')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreCallTest;
