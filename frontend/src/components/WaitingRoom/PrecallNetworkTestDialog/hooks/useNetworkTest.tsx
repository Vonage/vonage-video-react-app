import { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import NetworkTest, {
  type ErrorNames,
  type QualityTestResults,
} from '@vonage/video-client-network-test';
import OT from '@vonage/client-sdk-video';
import fetchCredentials from '@api/fetchCredentials';
import CancelablePromise from 'easy-cancelable-promise/CancelablePromise';
import attempt from '@common/execution/attempt';
import useMountEffect from '@web/hooks/useMountEffect';

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
  error: NetworkTestError | null;
};

/**
 * Hook for running Vonage Video API network connectivity and quality tests.
 * Provides methods to test device access, connectivity to Vonage Video API servers,
 * and audio/video quality with MOS estimates.
 * @returns {NetworkTestHookType} Object containing test state and methods
 */
const useNetworkTest = () => {
  const { t } = useTranslation();

  const testPromiseRef = useRef<CancelablePromise<QualityResults> | null>(null);

  const [state, setState] = useState<NetworkTestState>({
    isTestingQuality: false,
    connectivityResults: null,
    qualityResults: null,
    error: null,
  });

  // /**
  //  * The @vonage/video-client-network-test library `stop()` does not guarantee that an in-flight
  //  * `testQuality()` promise will never resolve afterwards (the library may wait for enough stats
  //  * before completing). To ensure the UI truly stops, we invalidate the active run so any late
  //  * callbacks/results are ignored and cannot update React state.
  //  */
  // const activeQualityTestRunIdentifierRef = useRef(0);

  // const isActiveQualityTestRun = useCallback((runIdentifier: number) => {
  //   return activeQualityTestRunIdentifierRef.current === runIdentifier;
  // }, []);

  const clearResults = useCallback(() => {
    setState({
      isTestingQuality: false,
      connectivityResults: null,
      qualityResults: null,
      error: null,
    });
  }, []);

  const stopTest = useCallback(() => {
    void testPromiseRef.current?.cancel();
  }, []);

  const testQuality = useCallback(
    (roomName: string, options: NetworkTestOptions = {}): CancelablePromise<QualityResults> => {
      const isPending = testPromiseRef.current?.status === 'pending';
      if (isPending) return testPromiseRef.current!;

      setState((prev) => ({
        ...prev,
        isTestingQuality: true,
        error: null,
      }));

      return (testPromiseRef.current = new CancelablePromise<QualityResults>(
        async (resolve, reject, { isCanceled, reportProgress, onCancel }) => {
          try {
            const credentials = await fetchCredentials(roomName);

            if (isCanceled()) return;

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

            onCancel(() => {
              void attempt(() => {
                networkTest.stop();
              });

              setState((prev) => ({
                ...prev,
                isTestingQuality: false,
              }));
            });

            // timeout after 30s

            const qualityResults = await new Promise<QualityTestResults>((res, rej) => {
              const timeout = setTimeout(
                () => rej(new Error('Network test timed out')),
                options.timeout || 30000
              );

              networkTest
                .testQuality((qualityUpdateStats) => {
                  if (isCanceled()) return;

                  reportProgress(-1, qualityUpdateStats);
                })
                .then(res)
                .catch(rej)
                .finally(() => {
                  clearTimeout(timeout);
                });
            });

            if (isCanceled()) return;

            setState((prev) => ({
              ...prev,
              qualityResults,
              isTestingQuality: false,
            }));

            return resolve(qualityResults);
          } catch (error) {
            if (isCanceled()) return;

            const networkError: NetworkTestError = {
              message:
                error instanceof Error ? error.message : t('waitingRoom.precallNetworkTest.error'),
              name: (error as Error & { name?: string })?.name || 'NetworkTestError',
            };

            setState((prev) => ({
              ...prev,
              error: networkError,
              isTestingQuality: false,
            }));

            reject(networkError);
          }
        }
      ));
    },
    [t]
  );

  useMountEffect(() => {
    return () => {
      stopTest();
    };
  });

  return {
    state,
    testQuality,
    stopTest,
    clearResults,
  };
};

export { ErrorNames };
export default useNetworkTest;
