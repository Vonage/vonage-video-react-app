import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, renderHook as renderHookBase, waitFor } from '@testing-library/react';
import type { Publisher } from '@vonage/client-sdk-video';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import advancedSettings$ from '@Context/AdvancedSettings';
import useApplyAdvancedSettings from './useApplyAdvancedSettings';

const createMockPublisher = () =>
  ({
    setPreferredFrameRate: vi.fn().mockResolvedValue(undefined),
    setPreferredResolution: vi.fn().mockResolvedValue(undefined),
    setMaxVideoBitrate: vi.fn().mockResolvedValue(undefined),
    setVideoBitratePreset: vi.fn().mockResolvedValue(undefined),
  }) as unknown as Publisher;

describe('useApplyAdvancedSettings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('frameRate', () => {
    it('calls setPreferredFrameRate with context frameRate on mount', async () => {
      const publisher = createMockPublisher();

      renderHook(() => useApplyAdvancedSettings(publisher), {
        advancedSettingsContext: { dialogState: { frameRate: 15 } },
      });

      await waitFor(() => {
        expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(15);
      });
    });

    it('re-calls setPreferredFrameRate when frameRate changes', async () => {
      const publisher = createMockPublisher();

      const { result } = renderHook(
        () => {
          useApplyAdvancedSettings(publisher);
          return advancedSettings$.use.actions;
        },
        { advancedSettingsContext: { dialogState: { frameRate: 30 } } }
      );

      await waitFor(() => {
        expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(30);
      });

      act(() => {
        result.current.setFrameRate(7);
      });

      await waitFor(() => {
        expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(7);
      });
    });

    it('does not call setPreferredFrameRate when publisher is null', () => {
      const publisher = createMockPublisher();

      renderHook(() => useApplyAdvancedSettings(null), {
        advancedSettingsContext: { dialogState: { frameRate: 15 } },
      });

      expect(publisher.setPreferredFrameRate).not.toHaveBeenCalled();
    });

    it('calls setPreferredFrameRate when publisher changes from null to instance', async () => {
      const publisher = createMockPublisher();
      let currentPublisher: Publisher | null = null;

      const { rerender } = renderHook(() => useApplyAdvancedSettings(currentPublisher), {
        advancedSettingsContext: { dialogState: { frameRate: 7 } },
      });

      expect(publisher.setPreferredFrameRate).not.toHaveBeenCalled();

      currentPublisher = publisher;
      rerender();

      await waitFor(() => {
        expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(7);
      });
    });
  });

  describe('resolution', () => {
    it('calls setPreferredResolution with parsed dimensions on mount', async () => {
      const publisher = createMockPublisher();

      renderHook(() => useApplyAdvancedSettings(publisher), {
        advancedSettingsContext: { dialogState: { resolution: '640x480' } },
      });

      await waitFor(() => {
        expect(publisher.setPreferredResolution).toHaveBeenCalledWith({ width: 640, height: 480 });
      });
    });

    it('parses 1920x1080 correctly', async () => {
      const publisher = createMockPublisher();

      renderHook(() => useApplyAdvancedSettings(publisher), {
        advancedSettingsContext: { dialogState: { resolution: '1920x1080' } },
      });

      await waitFor(() => {
        expect(publisher.setPreferredResolution).toHaveBeenCalledWith({
          width: 1920,
          height: 1080,
        });
      });
    });

    it('re-calls setPreferredResolution when resolution changes', async () => {
      const publisher = createMockPublisher();

      const { result } = renderHook(
        () => {
          useApplyAdvancedSettings(publisher);
          return advancedSettings$.use.actions;
        },
        { advancedSettingsContext: { dialogState: { resolution: '1280x720' } } }
      );

      await waitFor(() => {
        expect(publisher.setPreferredResolution).toHaveBeenCalledWith({ width: 1280, height: 720 });
      });

      act(() => {
        result.current.setResolution('640x480');
      });

      await waitFor(() => {
        expect(publisher.setPreferredResolution).toHaveBeenCalledWith({ width: 640, height: 480 });
      });
    });

    it('does not call setPreferredResolution when publisher is null', () => {
      const publisher = createMockPublisher();

      renderHook(() => useApplyAdvancedSettings(null), {
        advancedSettingsContext: { dialogState: { resolution: '640x480' } },
      });

      expect(publisher.setPreferredResolution).not.toHaveBeenCalled();
    });
  });

  describe('bitrate', () => {
    it('calls setVideoBitratePreset with default mode', async () => {
      const publisher = createMockPublisher();

      renderHook(() => useApplyAdvancedSettings(publisher), {
        advancedSettingsContext: { dialogState: { bitrateMode: 'default' } },
      });

      await waitFor(() => {
        expect(publisher.setVideoBitratePreset).toHaveBeenCalledWith('default');
      });
    });

    it('calls setVideoBitratePreset with bw_saver mode', async () => {
      const publisher = createMockPublisher();

      renderHook(() => useApplyAdvancedSettings(publisher), {
        advancedSettingsContext: { dialogState: { bitrateMode: 'bw_saver' } },
      });

      await waitFor(() => {
        expect(publisher.setVideoBitratePreset).toHaveBeenCalledWith('bw_saver');
      });
    });

    it('calls setVideoBitratePreset with extra_bw_saver mode', async () => {
      const publisher = createMockPublisher();

      renderHook(() => useApplyAdvancedSettings(publisher), {
        advancedSettingsContext: { dialogState: { bitrateMode: 'extra_bw_saver' } },
      });

      await waitFor(() => {
        expect(publisher.setVideoBitratePreset).toHaveBeenCalledWith('extra_bw_saver');
      });
    });

    it('calls setMaxVideoBitrate and not setVideoBitratePreset when mode is custom', async () => {
      const publisher = createMockPublisher();

      renderHook(() => useApplyAdvancedSettings(publisher), {
        advancedSettingsContext: {
          dialogState: { bitrateMode: 'custom', customVideoBitrate: 750_000 },
        },
      });

      await waitFor(() => {
        expect(publisher.setMaxVideoBitrate).toHaveBeenCalledWith(750_000);
        expect(publisher.setVideoBitratePreset).not.toHaveBeenCalled();
      });
    });

    it('switches to setMaxVideoBitrate when bitrateMode changes to custom', async () => {
      const publisher = createMockPublisher();

      const { result } = renderHook(
        () => {
          useApplyAdvancedSettings(publisher);
          return advancedSettings$.use.actions;
        },
        {
          advancedSettingsContext: {
            dialogState: { bitrateMode: 'default', customVideoBitrate: 500_000 },
          },
        }
      );

      await waitFor(() => {
        expect(publisher.setVideoBitratePreset).toHaveBeenCalledWith('default');
      });

      act(() => {
        result.current.setBitrateMode('custom');
      });

      await waitFor(() => {
        expect(publisher.setMaxVideoBitrate).toHaveBeenCalledWith(500_000);
      });
    });

    it('does not call bitrate methods when publisher is null', () => {
      const publisher = createMockPublisher();

      renderHook(() => useApplyAdvancedSettings(null), {
        advancedSettingsContext: { dialogState: { bitrateMode: 'bw_saver' } },
      });

      expect(publisher.setVideoBitratePreset).not.toHaveBeenCalled();
    });
  });
});

type RenderOptions = {
  advancedSettingsContext?: ProviderOptions['AdvancedSettingsContext'];
};

function renderHook<Result>(render: () => Result, { advancedSettingsContext }: RenderOptions = {}) {
  const { wrapper } = makeTestProvider([providers.advancedSettings], {
    advancedSettingsContext,
  });

  return renderHookBase(render, { wrapper });
}
