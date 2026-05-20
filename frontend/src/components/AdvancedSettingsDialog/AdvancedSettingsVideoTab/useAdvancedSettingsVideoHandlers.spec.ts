import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import type { Publisher } from '@vonage/client-sdk-video';
import type { PublisherContextType } from '@Context/PublisherProvider';
import type { PreviewPublisherContextType } from '@Context/PreviewPublisherProvider';
import usePublisherContext from '@hooks/usePublisherContext';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import advancedSettings$ from '@Context/AdvancedSettings';
import useAdvancedSettingsVideoHandlers from './useAdvancedSettingsVideoHandlers';

vi.mock('@hooks/usePublisherContext');
vi.mock('@hooks/usePreviewPublisherContext');

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;
const mockUsePreviewPublisherContext = usePreviewPublisherContext as Mock<
  [],
  PreviewPublisherContextType
>;

const createMockPublisher = () =>
  ({
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

      result.current.handleFrameRateChange(15);

      await waitFor(() => {
        expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(15);
        expect(advancedSettings$.getState().frameRate).toBe(15);
      });
    });

    it('still updates store when no publisher is active', async () => {
      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      result.current.handleFrameRateChange(7);

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

      result.current.handleFrameRateChange(15);

      await waitFor(() => {
        expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(15);
      });

      expect(advancedSettings$.getState().frameRate).toBe(initialFrameRate);
    });
  });

  describe('handleBitrateModeChange', () => {
    it('applies bitrate preset to publisher then updates store', async () => {
      const publisher = createMockPublisher();
      mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

      const { result } = renderHook(() =>
        useAdvancedSettingsVideoHandlers({ bitrateMode: 'default', customVideoBitrate: 500_000 })
      );

      result.current.handleBitrateModeChange('bw_saver');

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

      result.current.handleBitrateModeChange('bw_saver');

      await waitFor(() => {
        expect(previewPublisher.setVideoBitratePreset).toHaveBeenCalledWith('bw_saver');
      });
    });
  });
});
