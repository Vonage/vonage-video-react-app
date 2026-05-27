import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import type { Publisher } from '@vonage/client-sdk-video';
import type { PublisherContextType } from '@Context/PublisherProvider';
import type { PreviewPublisherContextType } from '@Context/PreviewPublisherProvider';
import usePublisherContext from '@hooks/usePublisherContext';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import advancedSettings$ from '@Context/AdvancedSettings';
import { handleClientApplicationError } from '@ui/helpers';
import useAdvancedSettingsVideoHandlers from './useAdvancedSettingsVideoHandlers';

vi.mock('@hooks/usePublisherContext');
vi.mock('@hooks/usePreviewPublisherContext');
vi.mock('@ui/helpers', () => ({
  handleClientApplicationError: vi.fn(),
}));

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;
const mockUsePreviewPublisherContext = usePreviewPublisherContext as Mock<
  [],
  PreviewPublisherContextType
>;
const mockHandleClientApplicationError = vi.mocked(handleClientApplicationError);

const createMockPublisher = () =>
  ({
    getVideoSource: vi.fn().mockReturnValue({ track: {} }),
    setPreferredFrameRate: vi.fn().mockResolvedValue(undefined),
    setPreferredResolution: vi.fn().mockResolvedValue(undefined),
    setMaxVideoBitrate: vi.fn().mockResolvedValue(undefined),
    setVideoBitratePreset: vi.fn().mockResolvedValue(undefined),
  }) as unknown as Publisher;

describe('useAdvancedSettingsVideoHandlers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockUsePublisherContext.mockReturnValue({ publisher: null } as PublisherContextType);
    mockUsePreviewPublisherContext.mockReturnValue({
      publisher: null,
    } as unknown as PreviewPublisherContextType);
  });

  afterEach(() => {
    advancedSettings$.reset();
  });

  describe('handleFrameRateChange', () => {
    it('applies frame rate to publisher then updates store', async () => {
      const publisher = createMockPublisher();
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleFrameRateChange(15);
      });

      await waitFor(() => {
        expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(15);
        expect(advancedSettings$.getState().frameRate).toBe(15);
      });
    });

    it('still updates store when no publisher is active', async () => {
      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleFrameRateChange(7);
      });

      await waitFor(() => {
        expect(advancedSettings$.getState().frameRate).toBe(7);
      });
    });

    it('does not update store when publisher call fails', async () => {
      const publisher = createMockPublisher();
      (publisher.setPreferredFrameRate as Mock).mockRejectedValue(new Error('hardware error'));
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

      const initialFrameRate = advancedSettings$.getState().frameRate;

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleFrameRateChange(15);
      });

      await waitFor(() => {
        expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(15);
      });

      expect(advancedSettings$.getState().frameRate).toBe(initialFrameRate);
    });

    it('reports a notification after a failed frame rate update', async () => {
      const publisher = createMockPublisher();
      (publisher.setPreferredFrameRate as Mock).mockRejectedValue(new Error('hardware error'));
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleFrameRateChange(15);
      });

      await waitFor(() => {
        expect(mockHandleClientApplicationError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('handleResolutionChange', () => {
    it('applies resolution to publisher then updates store', async () => {
      const publisher = createMockPublisher();
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleResolutionChange('640x480');
      });

      await waitFor(() => {
        expect(publisher.setPreferredResolution).toHaveBeenCalledWith({ width: 640, height: 480 });
        expect(advancedSettings$.getState().resolution).toBe('640x480');
      });
    });

    it('does not update store when resolution update fails', async () => {
      const publisher = createMockPublisher();
      (publisher.setPreferredResolution as Mock).mockRejectedValue(new Error('unsupported'));
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);
      const initialResolution = advancedSettings$.getState().resolution;

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleResolutionChange('640x480');
      });

      await waitFor(() => {
        expect(mockHandleClientApplicationError).toHaveBeenCalledTimes(1);
      });

      expect(advancedSettings$.getState().resolution).toBe(initialResolution);
    });
  });

  describe('handleBitrateModeChange', () => {
    it('applies bitrate preset to publisher then updates store', async () => {
      const publisher = createMockPublisher();
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleBitrateModeChange('bw_saver');
      });

      await waitFor(() => {
        expect(publisher.setVideoBitratePreset).toHaveBeenCalledWith('bw_saver');
        expect(advancedSettings$.getState().bitrateMode).toBe('bw_saver');
      });
    });

    it('uses preview publisher when no meeting room publisher is active', async () => {
      const previewPublisher = createMockPublisher();
      mockUsePreviewPublisherContext.mockReturnValue({
        publisher: previewPublisher,
      } as unknown as PreviewPublisherContextType);

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleBitrateModeChange('bw_saver');
      });

      await waitFor(() => {
        expect(previewPublisher.setVideoBitratePreset).toHaveBeenCalledWith('bw_saver');
      });
    });

    it('does not update store when bitrate preset update fails', async () => {
      const publisher = createMockPublisher();
      (publisher.setVideoBitratePreset as Mock).mockRejectedValue(new Error('unsupported'));
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);
      const initialBitrateMode = advancedSettings$.getState().bitrateMode;

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleBitrateModeChange('bw_saver');
      });

      await waitFor(() => {
        expect(mockHandleClientApplicationError).toHaveBeenCalledTimes(1);
      });

      expect(advancedSettings$.getState().bitrateMode).toBe(initialBitrateMode);
    });
  });

  describe('handleCustomVideoBitrateChange', () => {
    it('applies custom bitrate to publisher then updates store when mode is custom', async () => {
      const publisher = createMockPublisher();
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'custom', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleCustomVideoBitrateChange(750_000);
      });

      await waitFor(() => {
        expect(publisher.setMaxVideoBitrate).toHaveBeenCalledWith(750_000);
        expect(advancedSettings$.getState().customVideoBitrate).toBe(750_000);
      });
    });

    it('updates store without calling the publisher when mode is not custom', async () => {
      const publisher = createMockPublisher();
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleCustomVideoBitrateChange(750_000);
      });

      await waitFor(() => {
        expect(advancedSettings$.getState().customVideoBitrate).toBe(750_000);
      });

      expect(publisher.setMaxVideoBitrate).not.toHaveBeenCalled();
      expect(publisher.setVideoBitratePreset).not.toHaveBeenCalled();
    });

    it('does not update store when custom bitrate update fails', async () => {
      const publisher = createMockPublisher();
      (publisher.setMaxVideoBitrate as Mock).mockRejectedValue(new Error('unsupported'));
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);
      const initialCustomVideoBitrate = advancedSettings$.getState().customVideoBitrate;

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'custom', customVideoBitrate: 500_000 })
      );

      await act(async () => {
        await result.current.handleCustomVideoBitrateChange(750_000);
      });

      await waitFor(() => {
        expect(mockHandleClientApplicationError).toHaveBeenCalledTimes(1);
      });

      expect(advancedSettings$.getState().customVideoBitrate).toBe(initialCustomVideoBitrate);
    });
  });
});
