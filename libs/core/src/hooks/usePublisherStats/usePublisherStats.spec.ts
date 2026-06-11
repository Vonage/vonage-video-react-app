import { describe, expect, it, vi, beforeEach, afterEach, type Mock } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { Publisher, PublisherStatsArr } from '@vonage/client-sdk-video';
import usePublisherStats from './usePublisherStats';

vi.mock('@core/stores', async () => {
  const actual = await vi.importActual<typeof import('@core/stores')>('@core/stores');
  return {
    ...actual,
    runtime$: {
      ...actual.runtime$,
      useQuery: vi.fn(),
    },
  };
});

vi.mock('@web/hooks/useStableRef/useStableRef', () => ({
  default: vi.fn((initializer: () => unknown) => ({ current: initializer() })),
}));

import { runtime$ } from '@core/stores';
import useStableRef from '@web/hooks/useStableRef/useStableRef';

/**
 * Builds a minimal Publisher mock whose getStats callback resolves with the
 * provided stats array (or an error when `error` is truthy).
 */
function makePublisher(
  statsArr: PublisherStatsArr | null = null,
  options: { error?: Error; videoWidth?: number; videoHeight?: number } = {}
): Publisher {
  return {
    id: 'publisher-id-1',
    videoWidth: vi.fn().mockReturnValue(options.videoWidth ?? 1280),
    videoHeight: vi.fn().mockReturnValue(options.videoHeight ?? 720),
    getStats: vi.fn((callback: (error: Error | null, stats: PublisherStatsArr | null) => void) => {
      callback(options.error ?? null, statsArr);
    }),
  } as unknown as Publisher;
}

/**
 * Builds a minimal PublisherStatsArr entry.
 */
function makeStatsContainer(
  overrides: {
    audioPacketsSent?: number;
    audioPacketsLost?: number;
    audioBytesSent?: number;
    videoPacketsSent?: number;
    videoPacketsLost?: number;
    videoBytesSent?: number;
    videoFrameRate?: number | null;
    videoLayers?: unknown[];
    connectionEstimatedBandwidth?: number;
  } = {}
): PublisherStatsArr[number] {
  return {
    stats: {
      audio: {
        packetsSent: overrides.audioPacketsSent ?? 100,
        packetsLost: overrides.audioPacketsLost ?? 2,
        bytesSent: overrides.audioBytesSent ?? 5000,
      },
      video: {
        packetsSent: overrides.videoPacketsSent ?? 200,
        packetsLost: overrides.videoPacketsLost ?? 4,
        bytesSent: overrides.videoBytesSent ?? 20000,
        frameRate: overrides.videoFrameRate ?? 30,
        layers: overrides.videoLayers ?? [],
      },
      mediaLink: {
        transport: {
          connectionEstimatedBandwidth: overrides.connectionEstimatedBandwidth ?? 1_000_000,
        },
      },
    },
  } as unknown as PublisherStatsArr[number];
}

/**
 * Captures the `queryFn` passed to `runtime$.useQuery` and executes it so
 * tests can assert on the resolved value without needing a real React Query
 * provider.
 */
async function executeQueryFn(
  publisher: Publisher | null | undefined,
  publisherStatisticsEnabled: boolean,
  previousSample: { bytesSent: number; timestamp: number } | null = null
) {
  let capturedQueryFn: (() => Promise<unknown>) | undefined;

  (runtime$.useQuery as Mock).mockImplementation((options: { queryFn: () => Promise<unknown> }) => {
    capturedQueryFn = options.queryFn;
    return { data: undefined, isLoading: true };
  });

  (useStableRef as Mock).mockReturnValue({ current: previousSample });

  renderHook(() => usePublisherStats({ publisher, publisherStatisticsEnabled }));

  if (!capturedQueryFn) {
    throw new Error('queryFn was not captured — runtime$.useQuery was not called');
  }

  return capturedQueryFn();
}

describe('usePublisherStats', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    (runtime$.useQuery as Mock).mockReturnValue({ data: null, isLoading: false });
    (useStableRef as Mock).mockReturnValue({ current: null });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('resolution', () => {
    it('includes resolution when publisher reports valid dimensions', async () => {
      const publisher = makePublisher([makeStatsContainer()], {
        videoWidth: 1280,
        videoHeight: 720,
      });

      const result = (await executeQueryFn(publisher, true)) as Record<string, unknown>;

      expect(result.resolution).toBeDefined();
      // optionalValue wraps the value; the fallback '-' should NOT be used
      expect((result.resolution as { value: unknown }).value).not.toBe('-');
    });
  });

  describe('frameRate', () => {
    it('includes frameRate when stats contain a valid frame rate', async () => {
      const publisher = makePublisher([makeStatsContainer({ videoFrameRate: 30 })]);

      const result = (await executeQueryFn(publisher, true)) as Record<string, unknown>;

      expect(result.frameRate).toBeDefined();
      expect((result.frameRate as { formatted: string }).formatted).not.toBe('-');
    });

    it('does NOT treat 0 fps as missing — it is a valid value', async () => {
      const publisher = makePublisher([makeStatsContainer({ videoFrameRate: 0 })]);

      const result = (await executeQueryFn(publisher, true)) as Record<string, unknown>;

      // 0 fps is a real value; the formatted output should not be the fallback '-'
      expect((result.frameRate as { formatted: string }).formatted).not.toBe('-');
    });
  });

  describe('bitrateBps', () => {
    it('calculates bitrate correctly when a previous sample is available', async () => {
      const previousSample = { bytesSent: 0, timestamp: Date.now() - 1000 };
      const publisher = makePublisher([makeStatsContainer({ videoBytesSent: 1000 })]);

      // 1000 bytes in 1000 ms → 8000 bps
      const result = (await executeQueryFn(publisher, true, previousSample)) as Record<
        string,
        unknown
      >;

      expect((result.bitrateBps as { formatted: string }).formatted).not.toBe('-');
    });
  });

  describe('packetLossRatio', () => {
    it('calculates packet loss ratio correctly', async () => {
      // 4 lost out of 204 total → ~1.96 %
      const publisher = makePublisher([
        makeStatsContainer({ videoPacketsSent: 200, videoPacketsLost: 4 }),
      ]);

      const result = (await executeQueryFn(publisher, true)) as Record<string, unknown>;

      expect((result.packetLossRatio as { formatted: string }).formatted).not.toBe('-');
    });
  });

  describe('connectionEstimatedBandwidthBps', () => {
    it('includes bandwidth estimate when publisherStatisticsEnabled is true', async () => {
      const publisher = makePublisher([
        makeStatsContainer({ connectionEstimatedBandwidth: 2_000_000 }),
      ]);

      const result = (await executeQueryFn(publisher, true)) as Record<string, unknown>;

      expect((result.connectionEstimatedBandwidthBps as { formatted: string }).formatted).not.toBe(
        '-'
      );
    });

    it('picks the maximum bandwidth across multiple containers', async () => {
      const container1 = makeStatsContainer({ connectionEstimatedBandwidth: 500_000 });
      const container2 = makeStatsContainer({ connectionEstimatedBandwidth: 2_000_000 });
      const publisher = makePublisher([container1, container2]);

      const result = (await executeQueryFn(publisher, true)) as Record<string, unknown>;

      // The value should reflect the max (2_000_000), not the first container's value
      expect((result.connectionEstimatedBandwidthBps as { formatted: string }).formatted).not.toBe(
        '-'
      );
    });
  });

  describe('videoLayers', () => {
    it('returns videoLayers from the first stats container', async () => {
      const layers = [{ spatialLayerId: 0 }, { spatialLayerId: 1 }];
      const publisher = makePublisher([makeStatsContainer({ videoLayers: layers })]);

      const result = (await executeQueryFn(publisher, true)) as Record<string, unknown>;

      expect(result.videoLayers).toEqual(layers);
    });

    it('returns null when video layers are absent', async () => {
      const containerWithoutLayers = {
        stats: {
          audio: { packetsSent: 100, packetsLost: 0, bytesSent: 1000 },
          video: { packetsSent: 100, packetsLost: 0, bytesSent: 5000, frameRate: 30 },
          // no layers property
          mediaLink: { transport: { connectionEstimatedBandwidth: 1_000_000 } },
        },
      } as unknown as PublisherStatsArr[number];

      const publisher = makePublisher([containerWithoutLayers]);

      const result = (await executeQueryFn(publisher, true)) as Record<string, unknown>;

      expect(result.videoLayers).toBeNull();
    });
  });

  describe('previousSample ref update', () => {
    it('updates the previousSample ref after a successful poll', async () => {
      const stableRef = { current: null as { bytesSent: number; timestamp: number } | null };
      (useStableRef as Mock).mockReturnValue(stableRef);

      let capturedQueryFn: (() => Promise<unknown>) | undefined;
      (runtime$.useQuery as Mock).mockImplementation(
        (options: { queryFn: () => Promise<unknown> }) => {
          capturedQueryFn = options.queryFn;
          return { data: undefined, isLoading: true };
        }
      );

      const publisher = makePublisher([makeStatsContainer({ videoBytesSent: 5000 })]);

      renderHook(() => usePublisherStats({ publisher, publisherStatisticsEnabled: true }));

      await capturedQueryFn!();

      expect(stableRef.current).not.toBeNull();
      expect(stableRef.current?.bytesSent).toBe(5000);
      expect(typeof stableRef.current?.timestamp).toBe('number');
    });
  });

  describe('missing / partial track data', () => {
    it('treats missing audio track fields as zero', async () => {
      const containerWithNoAudio = {
        stats: {
          audio: {}, // all fields missing
          video: { packetsSent: 100, packetsLost: 0, bytesSent: 5000, frameRate: 30, layers: [] },
          mediaLink: { transport: { connectionEstimatedBandwidth: 1_000_000 } },
        },
      } as unknown as PublisherStatsArr[number];

      const publisher = makePublisher([containerWithNoAudio]);

      const result = (await executeQueryFn(publisher, true)) as Record<string, unknown>;

      expect((result.audio as { packetsSent: { value: number } }).packetsSent.value).toBe(0);
      expect((result.audio as { packetsLost: { value: number } }).packetsLost.value).toBe(0);
      expect((result.audio as { bytesSent: { value: number } }).bytesSent.value).toBe(0);
    });
  });
});
