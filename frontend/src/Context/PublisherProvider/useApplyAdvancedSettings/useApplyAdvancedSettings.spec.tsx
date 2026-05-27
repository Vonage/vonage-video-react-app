import { afterEach, describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook as renderHookBase, waitFor } from '@testing-library/react';
import type { Publisher } from '@vonage/client-sdk-video';
import type { advancedSettings } from '@Context/AdvancedSettings';
import advancedSettings$ from '@Context/AdvancedSettings';
import useApplyAdvancedSettings from './useApplyAdvancedSettings';

const createMockPublisher = () =>
  ({
    getVideoSource: vi.fn().mockReturnValue({ track: {} }),
    setPreferredFrameRate: vi.fn().mockResolvedValue(undefined),
    setPreferredResolution: vi.fn().mockResolvedValue(undefined),
    setMaxVideoBitrate: vi.fn().mockResolvedValue(undefined),
    setVideoBitratePreset: vi.fn().mockResolvedValue(undefined),
  }) as unknown as Publisher;

describe('useApplyAdvancedSettings', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    advancedSettings$.reset();
  });

  it('applies all current settings when publisher becomes available', async () => {
    const publisher = createMockPublisher();

    renderHook(() => useApplyAdvancedSettings(publisher), {
      dialogState: { frameRate: 15, resolution: '640x480', bitrateMode: 'default' },
    });

    await waitFor(() => {
      expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(15);
      expect(publisher.setPreferredResolution).toHaveBeenCalledWith({ width: 640, height: 480 });
      expect(publisher.setVideoBitratePreset).toHaveBeenCalledWith('default');
    });
  });

  it('calls setMaxVideoBitrate instead of setVideoBitratePreset when bitrateMode is custom', async () => {
    const publisher = createMockPublisher();

    renderHook(() => useApplyAdvancedSettings(publisher), {
      dialogState: { bitrateMode: 'custom', customVideoBitrate: 750_000 },
    });

    await waitFor(() => {
      expect(publisher.setMaxVideoBitrate).toHaveBeenCalledWith(750_000);
      expect(publisher.setVideoBitratePreset).not.toHaveBeenCalled();
    });
  });

  it('does nothing when publisher is null', () => {
    const publisher = createMockPublisher();

    renderHook(() => useApplyAdvancedSettings(null), {
      dialogState: { frameRate: 15 },
    });

    expect(publisher.setPreferredFrameRate).not.toHaveBeenCalled();
  });

  it('applies settings when publisher changes from null to an instance', async () => {
    const publisher = createMockPublisher();
    let currentPublisher: Publisher | null = null;

    const { rerender } = renderHook(() => useApplyAdvancedSettings(currentPublisher), {
      dialogState: { frameRate: 7 },
    });

    expect(publisher.setPreferredFrameRate).not.toHaveBeenCalled();

    currentPublisher = publisher;
    rerender();

    await waitFor(() => {
      expect(publisher.setPreferredFrameRate).toHaveBeenCalledWith(7);
    });
  });
});

type RenderOptions = {
  dialogState?: Partial<advancedSettings>;
};

function renderHook<Result>(render: () => Result, { dialogState }: RenderOptions = {}) {
  if (dialogState) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  return renderHookBase(render);
}
