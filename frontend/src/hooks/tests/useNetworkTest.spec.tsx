import { renderHook, act, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NetworkTest from '@vonage/video-client-network-test';
import useNetworkTest, {
  ConnectivityResults,
  QualityResults,
  QualityUpdateStats,
} from '../useNetworkTest';
import fetchCredentials from '../../api/fetchCredentials';

const mockNetworkTest = {
  testConnectivity: vi.fn(),
  testQuality: vi.fn(),
  stop: vi.fn(),
};

vi.mock('@vonage/video-client-network-test', () => {
  return {
    default: vi.fn().mockImplementation(() => mockNetworkTest),
  };
});

const mockCredentials = {
  data: {
    apiKey: 'test-api-key',
    sessionId: 'test-session-id',
    token: 'test-token',
  },
};

vi.mock('../../api/fetchCredentials', () => ({
  default: vi.fn(() => Promise.resolve(mockCredentials)),
}));

describe('useNetworkTest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (fetchCredentials as ReturnType<typeof vi.fn>).mockResolvedValue(mockCredentials);
    (NetworkTest as ReturnType<typeof vi.fn>).mockImplementation(() => mockNetworkTest);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useNetworkTest());

    expect(result.current.state).toEqual({
      isTestingConnectivity: false,
      isTestingQuality: false,
      connectivityResults: null,
      qualityResults: null,
      qualityStats: null,
      error: null,
    });
  });

  describe('testConnectivity', () => {
    it('should successfully run connectivity test', async () => {
      const mockResults: ConnectivityResults = { success: true };
      mockNetworkTest.testConnectivity.mockResolvedValue(mockResults);

      const { result } = renderHook(() => useNetworkTest());

      let testPromise: Promise<ConnectivityResults>;
      act(() => {
        testPromise = result.current.testConnectivity('test-room');
      });

      expect(result.current.state.isTestingConnectivity).toBe(true);
      expect(result.current.state.error).toBe(null);

      const results = await testPromise!;

      await waitFor(() => {
        expect(result.current.state.isTestingConnectivity).toBe(false);
        expect(result.current.state.connectivityResults).toEqual(mockResults);
        expect(result.current.state.error).toBe(null);
        expect(results).toEqual(mockResults);
      });

      expect(fetchCredentials).toHaveBeenCalledWith('test-room');
      expect(NetworkTest).toHaveBeenCalledWith(expect.anything(), {
        applicationId: 'test-api-key',
        sessionId: 'test-session-id',
        token: 'test-token',
      });
      expect(mockNetworkTest.testConnectivity).toHaveBeenCalled();
    });

    it('should handle connectivity test failure', async () => {
      const mockError = new Error('Connectivity test failed');
      mockError.name = 'NETWORK_ERROR';
      mockNetworkTest.testConnectivity.mockRejectedValue(mockError);

      const { result } = renderHook(() => useNetworkTest());

      let testPromise: Promise<ConnectivityResults>;
      act(() => {
        testPromise = result.current.testConnectivity('test-room');
      });

      expect(result.current.state.isTestingConnectivity).toBe(true);

      await expect(testPromise!).rejects.toThrow('Connectivity test failed');

      await waitFor(() => {
        expect(result.current.state.isTestingConnectivity).toBe(false);
        expect(result.current.state.error).toEqual({
          message: 'Connectivity test failed',
          name: 'NETWORK_ERROR',
        });
        expect(result.current.state.connectivityResults).toBe(null);
      });
    });
  });

  describe('testQuality', () => {
    it('should successfully run quality test', async () => {
      const mockResults: QualityResults = {
        video: { supported: true, mos: 4.2 },
        audio: { supported: true, mos: 4.5 },
      };
      mockNetworkTest.testQuality.mockResolvedValue(mockResults);

      const { result } = renderHook(() => useNetworkTest());

      let testPromise: Promise<QualityResults>;
      act(() => {
        testPromise = result.current.testQuality('test-room');
      });

      expect(result.current.state.isTestingQuality).toBe(true);
      expect(result.current.state.error).toBe(null);
      expect(result.current.state.qualityStats).toBe(null);

      const results = await testPromise!;

      await waitFor(() => {
        expect(result.current.state.isTestingQuality).toBe(false);
        expect(result.current.state.qualityResults).toEqual(mockResults);
        expect(result.current.state.error).toBe(null);
        expect(results).toEqual(mockResults);
      });

      expect(NetworkTest).toHaveBeenCalledWith(
        expect.anything(),
        {
          applicationId: 'test-api-key',
          sessionId: 'test-session-id',
          token: 'test-token',
        },
        {}
      );
      expect(mockNetworkTest.testQuality).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should run quality test with options', async () => {
      const mockResults: QualityResults = {
        video: { supported: true, mos: 4.2 },
      };
      const options = { audioOnly: true, timeout: 10000 };
      mockNetworkTest.testQuality.mockResolvedValue(mockResults);

      const { result } = renderHook(() => useNetworkTest());

      let testPromise: Promise<QualityResults>;
      act(() => {
        testPromise = result.current.testQuality('test-room', options);
      });

      const results = await testPromise!;

      expect(results).toEqual(mockResults);
      expect(NetworkTest).toHaveBeenCalledWith(
        expect.anything(),
        {
          applicationId: 'test-api-key',
          sessionId: 'test-session-id',
          token: 'test-token',
        },
        options
      );
    });

    it('should handle quality test failure', async () => {
      const mockError = new Error('Quality test failed');
      mockError.name = 'QUALITY_ERROR';
      mockNetworkTest.testQuality.mockRejectedValue(mockError);

      const { result } = renderHook(() => useNetworkTest());

      let testPromise: Promise<QualityResults>;
      act(() => {
        testPromise = result.current.testQuality('test-room');
      });

      expect(result.current.state.isTestingQuality).toBe(true);

      await expect(testPromise!).rejects.toThrow('Quality test failed');

      await waitFor(() => {
        expect(result.current.state.isTestingQuality).toBe(false);
        expect(result.current.state.error).toEqual({
          message: 'Quality test failed',
          name: 'QUALITY_ERROR',
        });
        expect(result.current.state.qualityResults).toBe(null);
      });
    });
  });

  describe('stopTest', () => {
    it('should stop ongoing test and update state', async () => {
      let resolveTest: (value: ConnectivityResults) => void;
      mockNetworkTest.testConnectivity.mockImplementation(
        () =>
          new Promise<ConnectivityResults>((resolve) => {
            resolveTest = resolve;
          })
      );

      const { result } = renderHook(() => useNetworkTest());

      act(() => {
        result.current.testConnectivity('test-room');
      });

      await waitFor(() => {
        expect(result.current.state.isTestingConnectivity).toBe(true);
      });

      act(() => {
        result.current.stopTest();
      });

      expect(result.current.state.isTestingConnectivity).toBe(false);
      expect(result.current.state.isTestingQuality).toBe(false);
      expect(mockNetworkTest.stop).toHaveBeenCalled();

      resolveTest!({ success: true });
    });
  });

  describe('clearResults', () => {
    it('should clear all results and reset state', async () => {
      const mockConnectivityResults: ConnectivityResults = { success: true };
      const mockQualityResults: QualityResults = {
        video: { supported: true, mos: 4.2 },
      };
      const mockStats: QualityUpdateStats = {
        video: { frameRate: 30 },
        timestamp: Date.now(),
      };

      mockNetworkTest.testConnectivity.mockResolvedValue(mockConnectivityResults);
      mockNetworkTest.testQuality.mockImplementation((callback) => {
        callback(mockStats);
        return Promise.resolve(mockQualityResults);
      });

      const { result } = renderHook(() => useNetworkTest());

      await act(async () => {
        await result.current.testConnectivity('test-room');
        await result.current.testQuality('test-room');
      });

      expect(result.current.state.connectivityResults).toEqual(mockConnectivityResults);
      expect(result.current.state.qualityResults).toEqual(mockQualityResults);
      expect(result.current.state.qualityStats).toEqual(mockStats);

      act(() => {
        result.current.clearResults();
      });

      expect(result.current.state).toEqual({
        isTestingConnectivity: false,
        isTestingQuality: false,
        connectivityResults: null,
        qualityResults: null,
        qualityStats: null,
        error: null,
      });
    });
  });
});
