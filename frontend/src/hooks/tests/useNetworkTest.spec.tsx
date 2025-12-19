import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import fetchCredentials from '@api/fetchCredentials';

const mockNetworkTest = {
  testQuality: vi.fn(),
  stop: vi.fn(),
};

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
const mockFetchCredentials = fetchCredentials as Mock;

const mockT = vi.fn((key: string) => key);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: mockT,
  }),
}));

import useNetworkTest from '../useNetworkTest';
import type { QualityResults, QualityUpdateStats } from '../useNetworkTest';
import NetworkTestConstructor from '@vonage/video-client-network-test';

describe('useNetworkTest', () => {
  const mockCredentials = {
    data: {
      apiKey: 'test-api-key',
      sessionId: 'test-session-id',
      token: 'test-token',
    },
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
    mockFetchCredentials.mockResolvedValue(mockCredentials);
    mockNetworkTest.testQuality.mockResolvedValue(mockQualityResults);
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useNetworkTest());

    expect(result.current).not.toBeNull();
    expect(result.current).toBeDefined();
    expect(result.current.state).toEqual({
      isTestingQuality: false,
      connectivityResults: null,
      qualityResults: null,
      qualityStats: null,
      error: null,
    });
  });

  it('testQuality fetches credentials and creates NetworkTest instance', async () => {
    const { result } = renderHook(() => useNetworkTest());

    await act(async () => {
      await result.current.testQuality('test-room');
    });

    expect(mockFetchCredentials).toHaveBeenCalledWith('test-room');
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

  it('testQuality calls update callback with stats', async () => {
    const { result } = renderHook(() => useNetworkTest());
    const mockUpdateCallback = vi.fn();
    const mockStats: QualityUpdateStats = {
      audio: {
        timestamp: 123456,
        bytesSent: 1000,
        bytesReceived: 900,
        packetsReceived: 100,
        packetsLost: 2,
      },
      video: {
        timestamp: 123456,
        bytesSent: 5000,
        bytesReceived: 4800,
        frameRate: 30,
        packetsReceived: 200,
        packetsLost: 5,
      },
      phase: 'testing',
    };

    mockNetworkTest.testQuality.mockImplementation((callback) => {
      callback(mockStats);
      return mockQualityResults;
    });

    await act(async () => {
      await result.current.testQuality('test-room', {}, mockUpdateCallback);
    });

    expect(mockUpdateCallback).toHaveBeenCalledWith(mockStats);
    expect(result.current.state.qualityStats).toEqual(mockStats);
  });

  it('testQuality returns quality results', async () => {
    const { result } = renderHook(() => useNetworkTest());

    let returnedResults: QualityResults | undefined;
    await act(async () => {
      returnedResults = await result.current.testQuality('test-room');
    });

    expect(returnedResults).toEqual(mockQualityResults);
  });

  it('testQuality handles errors correctly', async () => {
    const { result } = renderHook(() => useNetworkTest());
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

  it('stopTest stops the network test instance', async () => {
    const { result } = renderHook(() => useNetworkTest());

    act(() => {
      result.current.testQuality('test-room');
    });

    await waitFor(() => {
      expect(result.current.state.isTestingQuality).toBe(true);
    });

    act(() => {
      result.current.stopTest();
    });

    expect(mockNetworkTest.stop).toHaveBeenCalled();
    expect(result.current.state.isTestingQuality).toBe(false);
  });

  it('stopTest does nothing when no test is running', () => {
    const { result } = renderHook(() => useNetworkTest());

    act(() => {
      result.current.stopTest();
    });

    expect(mockNetworkTest.stop).not.toHaveBeenCalled();
    expect(result.current.state.isTestingQuality).toBe(false);
  });

  it('clearResults resets state to initial values', async () => {
    const { result } = renderHook(() => useNetworkTest());

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
      qualityStats: null,
      error: null,
    });
  });
});
