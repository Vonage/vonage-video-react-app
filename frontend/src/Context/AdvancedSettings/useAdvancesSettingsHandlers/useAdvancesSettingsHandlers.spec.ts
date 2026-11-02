import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import type { Publisher } from '@vonage/client-sdk-video';
import type { PublisherContextType } from '@Context/PublisherProvider';
import type { PreviewPublisherContextType } from '@Context/PreviewPublisherProvider';
import usePublisherContext from '@hooks/usePublisherContext';
import usePreviewPublisherContext from '@hooks/usePreviewPublisherContext';
import { makeTestProvider, providers } from '@test/providers';
import advancedSettings$ from '@Context/AdvancedSettings';
import { handleClientApplicationError } from '@ui/helpers';
import useAdvancesSettingsHandlers from './useAdvancesSettingsHandlers';

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

describe('useAdvancesSettingsHandlers', () => {
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

  it('applies the setting to the publisher then updates the store', async () => {
    const publisher = createMockPublisher();
    mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

    const { result } = renderHook(() => useAdvancesSettingsHandlers());

    await act(async () => {
      await result.current.handleFrameRateChange(15);
    });

    await waitFor(() => {
      expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(15);
      expect(advancedSettings$.getState().frameRate).toBe(15);
    });
  });

  it('keeps the store unchanged and reports an error when the publisher rejects the change', async () => {
    const publisher = createMockPublisher();
    (publisher.setPreferredFrameRate as Mock).mockRejectedValue(new Error('hardware error'));
    mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

    const initialFrameRate = advancedSettings$.getState().frameRate;

    const { result } = renderHook(() => useAdvancesSettingsHandlers());

    await act(async () => {
      await result.current.handleFrameRateChange(15);
    });

    await waitFor(() => {
      expect(mockHandleClientApplicationError).toHaveBeenCalledTimes(1);
    });

    expect(advancedSettings$.getState().frameRate).toBe(initialFrameRate);
  });

  it('updates the store when no publisher is active', async () => {
    const { result } = renderHook(() => useAdvancesSettingsHandlers());

    await act(async () => {
      await result.current.handleFrameRateChange(7);
    });

    await waitFor(() => {
      expect(advancedSettings$.getState().frameRate).toBe(7);
    });
  });

  it('applies the custom bitrate only while the mode is custom', async () => {
    const publisher = createMockPublisher();
    mockUsePublisherContext.mockReturnValue({ publisher } as PublisherContextType);

    advancedSettings$.actions.setBitrateMode('default');

    const { result } = renderHook(() => useAdvancesSettingsHandlers());

    await act(async () => {
      await result.current.handleCustomVideoBitrateChange(750_000);
    });

    await waitFor(() => {
      expect(advancedSettings$.getState().customVideoBitrate).toBe(750_000);
    });

    expect(publisher.setMaxVideoBitrate).not.toHaveBeenCalled();

    advancedSettings$.actions.setBitrateMode('custom');

    await act(async () => {
      await result.current.handleCustomVideoBitrateChange(500_000);
    });

    await waitFor(() => {
      expect(publisher.setMaxVideoBitrate).toHaveBeenCalledWith(500_000);
    });
  });

  it('routes screen-share changes to the share publisher, not the camera', async () => {
    const sharePublisher = createMockPublisher();
    const cameraPublisher = createMockPublisher();
    mockUsePublisherContext.mockReturnValue({
      publisher: cameraPublisher,
    } as PublisherContextType);

    const { wrapper, screenShareContext } = makeTestProvider([
      providers.runtime,
      providers.user,
      providers.session,
      providers.screenShare,
    ]);
    const { result } = renderHook(() => useAdvancesSettingsHandlers(), { wrapper });

    act(() => {
      screenShareContext.current?.setState((state) => ({ ...state, publisher: sharePublisher }));
    });

    await act(async () => {
      await result.current.handleScreenShareFrameRateChange(7);
    });

    await waitFor(() => {
      expect(sharePublisher.setPreferredFrameRate).toHaveBeenCalledWith(7);
      expect(advancedSettings$.getState().screenShareFrameRate).toBe(7);
    });

    expect(cameraPublisher.setPreferredFrameRate).not.toHaveBeenCalled();
  });
});
