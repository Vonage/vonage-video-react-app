import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import NetworkTest, { ErrorNames } from '@vonage/video-client-network-test';
import OT from '@vonage/client-sdk-video';
import fetchCredentials from '../api/fetchCredentials';
import tryCatch from '@common/execution/tryCatch';

export type QualityResults = {
  video?: {
    supported?: boolean;
    recommendedFrameRate?: number | null;
    recommendedResolution?: string | null;
    reason?: string;
    qualityLimitationReason?: string | null;
    bitrate?: number;
    frameRate?: number;
    packetLossRatio?: number;
    mos?: number;
  };
  audio?: {
    supported?: boolean;
    reason?: string;
    bitrate?: number;
    packetLossRatio?: number;
    mos?: number;
  };
};

export type QualityUpdateStats = {
  audio?: {
    timestamp?: number;
    bytesSent?: number;
    bytesReceived?: number;
    packetsReceived?: number;
    packetsLost?: number;
  };
  video?: {
    timestamp?: number;
    bytesReceived?: number;
    bytesSent?: number;
    frameRate?: number;
    packetsReceived?: number;
    packetsLost?: number;
  };
  timestamp?: number;
  phase?: string;
};

type ConnectivityResults = {
  success: boolean;
  failedTests?: Array<{
    type: string;
    error: {
      message: string;
      name: string;
    };
  }>;
};

type NetworkTestOptions = {
  audioOnly?: boolean;
  timeout?: number;
  audioSource?: string;
  videoSource?: string;
};

type NetworkTestError = {
  message: string;
  name: string;
};

type NetworkTestState = {
  isTestingQuality: boolean;
  connectivityResults: ConnectivityResults | null;
  qualityResults: QualityResults | null;
  qualityStats: QualityUpdateStats | null;
  error: NetworkTestError | null;
};

type NetworkTestHookType = {
  state: NetworkTestState;
  testQuality: (
    roomName: string,
    options?: NetworkTestOptions,
    updateCallback?: (stats: QualityUpdateStats) => void
  ) => Promise<QualityResults>;
  stopTest: () => void;
  clearResults: () => void;
};

/**
 * Hook for running Vonage Video API network connectivity and quality tests.
 * Provides methods to test device access, connectivity to Vonage Video API servers,
 * and audio/video quality with MOS estimates.
 * @returns {NetworkTestHookType} Object containing test state and methods
 */
const useNetworkTest = (): NetworkTestHookType => {
  const { t } = useTranslation();
  const [state, setState] = useState<NetworkTestState>({
    isTestingQuality: false,
    connectivityResults: null,
    qualityResults: null,
    qualityStats: null,
    error: null,
  });

  const networkTestRef = useRef<InstanceType<typeof NetworkTest> | null>(null);

  /**
   * The @vonage/video-client-network-test library `stop()` does not guarantee that an in-flight
   * `testQuality()` promise will never resolve afterwards (the library may wait for enough stats
   * before completing). To ensure the UI truly stops, we invalidate the active run so any late
   * callbacks/results are ignored and cannot update React state.
   */
  const activeQualityTestRunIdentifierRef = useRef(0);

  const isActiveQualityTestRun = useCallback((runIdentifier: number) => {
    return activeQualityTestRunIdentifierRef.current === runIdentifier;
  }, []);

  const clearResults = useCallback(() => {
    setState({
      isTestingQuality: false,
      connectivityResults: null,
      qualityResults: null,
      qualityStats: null,
      error: null,
    });
  }, []);

  const stopTest = useCallback(() => {
    activeQualityTestRunIdentifierRef.current += 1;

    const networkTest = networkTestRef.current;
    networkTestRef.current = null;

    if (networkTest) {
      void tryCatch(() => networkTest.stop());
    }

    setState((prev) => ({
      ...prev,
      isTestingQuality: false,
    }));
  }, []);

  const testQuality = useCallback(
    async (
      roomName: string,
      options: NetworkTestOptions = {},
      updateCallback?: (stats: QualityUpdateStats) => void
    ): Promise<QualityResults> => {
      const runIdentifier = activeQualityTestRunIdentifierRef.current + 1;
      activeQualityTestRunIdentifierRef.current = runIdentifier;

      setState((prev) => ({
        ...prev,
        isTestingQuality: true,
        error: null,
        qualityStats: null,
      }));

      try {
        const credentials = await fetchCredentials(roomName);

        if (!isActiveQualityTestRun(runIdentifier)) {
          return {};
        }

        const { apiKey, sessionId, token } = credentials.data;

        const networkTest = new NetworkTest(
          OT,
          {
            applicationId: apiKey,
            sessionId,
            token,
          },
          options
        );

        networkTestRef.current = networkTest;

        const internalUpdateCallback = (stats: QualityUpdateStats) => {
          if (!isActiveQualityTestRun(runIdentifier)) return;

          setState((prev) => ({
            ...prev,
            qualityStats: stats,
          }));
          if (updateCallback) {
            updateCallback(stats);
          }
        };

        const results = await networkTest.testQuality(internalUpdateCallback);

        if (!isActiveQualityTestRun(runIdentifier)) {
          return results;
        }

        setState((prev) => ({
          ...prev,
          isTestingQuality: false,
          qualityResults: results,
        }));

        return results;
      } catch (error) {
        if (!isActiveQualityTestRun(runIdentifier)) {
          return {};
        }

        const networkError: NetworkTestError = {
          message:
            error instanceof Error ? error.message : t('waitingRoom.precallNetworkTest.error'),
          name: (error as Error & { name?: string })?.name || 'NetworkTestError',
        };

        setState((prev) => ({
          ...prev,
          isTestingQuality: false,
          error: networkError,
        }));

        throw error;
      }
    },
    [t, isActiveQualityTestRun]
  );

  return {
    state,
    testQuality,
    stopTest,
    clearResults,
  };
};

export { ErrorNames };
export default useNetworkTest;
