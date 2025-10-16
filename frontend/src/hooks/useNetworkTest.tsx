import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import NetworkTest, { ErrorNames } from '@vonage/video-client-network-test';
import OT from '@vonage/client-sdk-video';
import fetchCredentials from '../api/fetchCredentials';

export type ConnectivityResults = {
  success: boolean;
  failedTests?: Array<{
    type: string;
    error: {
      message: string;
      name: string;
    };
  }>;
};

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

export type NetworkTestOptions = {
  audioOnly?: boolean;
  timeout?: number;
  audioSource?: string;
  videoSource?: string;
};

export type NetworkTestError = {
  message: string;
  name: string;
};

export type NetworkTestState = {
  isTestingQuality: boolean;
  connectivityResults: ConnectivityResults | null;
  qualityResults: QualityResults | null;
  qualityStats: QualityUpdateStats | null;
  error: NetworkTestError | null;
};

export type NetworkTestHookType = {
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
    if (networkTestRef.current) {
      try {
        networkTestRef.current.stop();
      } catch (error) {
        console.warn('Error stopping network test:', error);
      }
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
      setState((prev) => ({
        ...prev,
        isTestingQuality: true,
        error: null,
        qualityStats: null,
      }));

      try {
        const credentials = await fetchCredentials(roomName);
        const { apiKey, sessionId, token } = credentials.data;

        const networkTest = new NetworkTest(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          OT as any,
          {
            applicationId: apiKey,
            sessionId,
            token,
          },
          options
        );

        networkTestRef.current = networkTest;

        const internalUpdateCallback = (stats: QualityUpdateStats) => {
          setState((prev) => ({
            ...prev,
            qualityStats: stats,
          }));
          if (updateCallback) {
            updateCallback(stats);
          }
        };

        const results = await networkTest.testQuality(internalUpdateCallback);

        setState((prev) => ({
          ...prev,
          isTestingQuality: false,
          qualityResults: results,
        }));

        return results;
      } catch (error) {
        const networkError: NetworkTestError = {
          message:
            error instanceof Error ? error.message : t('precallTest.errors.unknownQualityTest'),
          name:
            (error as Error & { name?: string })?.name || t('precallTest.errors.qualityTestError'),
        };

        setState((prev) => ({
          ...prev,
          isTestingQuality: false,
          error: networkError,
        }));

        throw error;
      }
    },
    [t]
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
