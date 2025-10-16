import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Banner from '../../components/Banner';
import useNetworkTest from '../../hooks/useNetworkTest';
import useRoomName from '../../hooks/useRoomName';
import TestError from '../../components/PreCall/TestError';
import ConnectivityResults from '../../components/PreCall/ConnectivityResults';
import QualityResults from '../../components/PreCall/QualityResults';
import TestProgress from '../../components/PreCall/TestProgress';
import TestControls from '../../components/PreCall/TestControls';

/**
 * PreCallTest Component
 *
 * Provides network testing interface for Vonage Video API connectivity and quality testing.
 * @returns {ReactElement} - The pre-call test page.
 */
const PreCallTest = (): ReactElement => {
  const { t } = useTranslation();
  const roomName = useRoomName();
  const navigate = useNavigate();
  const [isTestingStarted, setIsTestingStarted] = useState(false);

  const { state, testConnectivity, testQuality, stopTest, clearResults } = useNetworkTest();

  const handleStartConnectivityTest = async () => {
    if (!roomName) {
      return;
    }

    try {
      setIsTestingStarted(true);
      await testConnectivity(roomName);
    } catch (error) {
      console.error('Connectivity test failed:', error);
    }
  };

  const handleStartQualityTest = async () => {
    if (!roomName) {
      return;
    }

    try {
      await testQuality(roomName, { timeout: 15000 });
    } catch (error) {
      console.error('Quality test failed:', error);
    }
  };

  const handleStopTest = () => {
    stopTest();
    setIsTestingStarted(false);
  };

  const handleClearResults = () => {
    clearResults();
    setIsTestingStarted(false);
  };

  const handleContinueToWaitingRoom = () => {
    navigate(`/waiting-room/${roomName}`);
  };

  const hasResults = Boolean(state.connectivityResults || state.qualityResults);
  const isTestingInProgress =
    state.qualityStats && (state.isTestingConnectivity || state.isTestingQuality);

  return (
    <div className="flex size-full flex-col justify-between bg-white">
      <Banner />

      <div className="flex size-full flex-col items-center justify-center bg-white px-4 py-8">
        <div className="w-full max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">{t('precallTest.title')}</h1>
          <p className="mb-8 text-gray-600">
            {t('precallTest.subtitle')}{' '}
            <span className="font-medium">{roomName || t('precallTest.loading')}</span>
          </p>

          {state.error && <TestError error={state.error} />}

          {state.connectivityResults && <ConnectivityResults results={state.connectivityResults} />}

          {state.qualityResults && <QualityResults results={state.qualityResults} />}

          {isTestingInProgress && <TestProgress />}

          <TestControls
            roomName={roomName}
            isTestingStarted={isTestingStarted}
            isTestingConnectivity={state.isTestingConnectivity}
            isTestingQuality={state.isTestingQuality}
            hasResults={hasResults}
            onStartConnectivityTest={handleStartConnectivityTest}
            onStartQualityTest={handleStartQualityTest}
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
