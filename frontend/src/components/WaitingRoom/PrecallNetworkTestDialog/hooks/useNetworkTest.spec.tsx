import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import NetworkTestConstructor from '@vonage/video-client-network-test';
import { makeTestProvider, providers } from '@test/providers';
import type { VideoClient } from '@core/services';

const mockNetworkTest = vi.hoisted(() => ({
  testQuality: vi.fn(),
  stop: vi.fn(),
}));

vi.mock('@vonage/video-client-network-test', () => {
  const MockNetworkTest = vi.fn(() => mockNetworkTest);

  return {
    __esModule: true,
    default: MockNetworkTest,
    ErrorNames: {
      UNSUPPORTED_BROWSER: 'UNSUPPORTED_BROWSER',
      MISSING_DEVICE_LABELS: 'MISSING_DEVICE_LABELS',
    },
  };
});

vi.mock('@vonage/client-sdk-video', () => ({
  __esModule: true,
  default: {},
}));

vi.mock('@api/fetchCredentials');

const mockCreateSessionAndJoinMutate = vi.fn();

const mockVideoClient = {
  createSessionAndJoin: (...args: unknown[]) => mockCreateSessionAndJoinMutate(...args) as unknown,
} as unknown as VideoClient;

const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

import useNetworkTest, { type QualityResults } from './useNetworkTest';
import wait from '@common/execution/wait/wait';
import CancelablePromise from 'easy-cancelable-promise';

const { wrapper } = makeTestProvider([providers.runtime], {
  runtimeContext: { videoClient: mockVideoClient },
});

function render<T>(hook: () => T) {
  return renderHook(hook, { wrapper });
}

describe('useNetworkTest', () => {
  const mockCredentials = {
    applicationId: 'test-api-key',
    sessionId: 'test-session-id',
    token: 'test-token',
  };

  const mockQualityResults: QualityResults = {
    video: {
      supported: true,
      recommendedFrameRate: 30,
      recommendedResolution: '1280x720',
      bitrate: 1000,
      frameRate: 30,
      packetLossRatio: 0.01,
      mos: 4.2,
    },
    audio: {
      supported: true,
      bitrate: 128,
      packetLossRatio: 0.005,
      mos: 4.5,
    },
  };

  beforeEach(() => {
    mockNetworkTest.testQuality.mockReset();
    mockNetworkTest.stop.mockReset();
    mockCreateSessionAndJoinMutate.mockResolvedValue(mockCredentials);
    mockNetworkTest.testQuality.mockResolvedValue(mockQualityResults);
  });

  it('returns initial state correctly', () => {
    const { result } = render(() => useNetworkTest());

    expect(result.current).not.toBeNull();
    expect(result.current).toBeDefined();
    expect(result.current.state).toEqual({
      isTestingQuality: false,
      connectivityResults: null,
      qualityResults: null,
      error: null,
    });
  });

  it('testQuality fetches credentials and creates NetworkTest instance', async () => {
    const { result } = render(() => useNetworkTest());

    await act(async () => {
      await result.current.testQuality('test-room');
    });

    expect(mockCreateSessionAndJoinMutate).toHaveBeenCalled();
    expect(NetworkTestConstructor).toHaveBeenCalledWith(
      expect.anything(),
      {
        applicationId: 'test-api-key',
        sessionId: 'test-session-id',
        token: 'test-token',
      },
      {}
    );
  });

  it('testQuality returns quality results', async () => {
    const { result } = render(() => useNetworkTest());

    let returnedResults: QualityResults | undefined;
    await act(async () => {
      returnedResults = await result.current.testQuality('test-room');
    });

    expect(returnedResults).toEqual(mockQualityResults);
  });

  it('testQuality handles errors correctly', async () => {
    const { result } = render(() => useNetworkTest());
    const mockError = new Error('Network test failed');
    mockError.name = 'NetworkError';
    mockNetworkTest.testQuality.mockRejectedValue(mockError);

    await act(async () => {
      await expect(result.current.testQuality('test-room')).rejects.toThrow('Network test failed');
    });

    expect(result.current.state.isTestingQuality).toBe(false);
    expect(result.current.state.error).toEqual({
      message: 'Network test failed',
      name: 'NetworkError',
    });
  });

  /**
   * TODO: We need to find a way of tell vitest that the unhandled reject is actually expected here.
   */
  it('stopTest stops the network test instance', async () => {
    const { result } = render(() => useNetworkTest());
    let promise: CancelablePromise<QualityResults>;

    vi.spyOn(mockNetworkTest, 'testQuality').mockImplementation(() => wait(10));

    act(() => {
      promise = result.current.testQuality('test-room');
    });

    await waitFor(() => {
      expect(result.current.state.isTestingQuality).toBe(true);
    });

    act(() => {
      result.current.stopTest();
    });

    void promise!.catch(() => {});

    expect(promise!.status).toBe('canceled');
    expect(result.current.state.isTestingQuality).toBe(false);
  });

  it('stopTest does nothing when no test is running', () => {
    const { result } = render(() => useNetworkTest());

    act(() => {
      result.current.stopTest();
    });

    expect(mockNetworkTest.stop).not.toHaveBeenCalled();
    expect(result.current.state.isTestingQuality).toBe(false);
  });

  it('stopTest prevents late quality results from updating state', async () => {
    const { result } = render(() => useNetworkTest());

    let promise: CancelablePromise<QualityResults> | null = null;

    let resolveQualityTest: ((value: QualityResults) => void) | null = null;

    mockNetworkTest.testQuality.mockImplementation(() => {
      return new Promise<QualityResults>((resolve) => {
        resolveQualityTest = resolve;
      });
    });

    promise = result.current.testQuality('test-room');

    await waitFor(() => {
      expect(result.current.state.isTestingQuality).toBe(true);
    });

    act(() => {
      result.current.stopTest();
    });

    void promise?.catch(() => {});

    await waitFor(() => {
      expect(result.current.state.isTestingQuality).toBe(false);
    });

    act(() => {
      resolveQualityTest?.(mockQualityResults);
    });

    await waitFor(() => {
      expect(result.current.state.qualityResults).toBeNull();
    });
  });

  it('clearResults resets state to initial values', async () => {
    const { result } = render(() => useNetworkTest());

    await act(async () => {
      await result.current.testQuality('test-room');
    });

    expect(result.current.state.qualityResults).not.toBeNull();

    act(() => {
      result.current.clearResults();
    });

    expect(result.current.state).toEqual({
      isTestingQuality: false,
      connectivityResults: null,
      qualityResults: null,
      error: null,
    });
  });
});
