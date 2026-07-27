import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Publisher } from '@vonage/client-sdk-video';
import applyAdvancedSettingsToPublisher, {
  applyBitrate,
  applyFrameRate,
  applyResolution,
} from './applyAdvancedSettingsToPublisher';
import { Resolution } from '@common/types';

const createMockPublisher = () =>
  ({
    getVideoSource: vi.fn().mockReturnValue({ track: {} }),
    setPreferredFrameRate: vi.fn().mockResolvedValue(undefined),
    setPreferredResolution: vi.fn().mockResolvedValue(undefined),
    setMaxVideoBitrate: vi.fn().mockResolvedValue(undefined),
    setVideoBitratePreset: vi.fn().mockResolvedValue(undefined),
    setVideoContentHint: vi.fn(),
  }) as unknown as Publisher;

describe('applyAdvancedSettingsToPublisher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns early for frame rate when publisher is null', async () => {
    await expect(applyFrameRate(null, 15)).resolves.toBeUndefined();
  });

  it('returns early for resolution when publisher is null', async () => {
    await expect(applyResolution(null, Resolution.VGA_LANDSCAPE)).resolves.toBeUndefined();
  });

  it('returns early for bitrate when publisher is null', async () => {
    await expect(applyBitrate(null, 'default', 500_000)).resolves.toBeUndefined();
  });

  it('applies parsed resolution dimensions', async () => {
    const publisher = createMockPublisher();

    await applyResolution(publisher, Resolution.VGA_LANDSCAPE);

    expect(publisher.setPreferredResolution).toHaveBeenCalledWith({ width: 640, height: 480 });
  });

  it('uses the preset bitrate method for non-custom bitrate modes', async () => {
    const publisher = createMockPublisher();

    await applyBitrate(publisher, 'bw_saver', 500_000);

    expect(publisher.setVideoBitratePreset).toHaveBeenCalledWith('bw_saver');
    expect(publisher.setMaxVideoBitrate).not.toHaveBeenCalled();
  });

  it('continues applying remaining settings when frame rate update fails', async () => {
    const publisher = createMockPublisher();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    publisher.setPreferredFrameRate = vi.fn().mockRejectedValue(new Error('frame rate failure'));

    await applyAdvancedSettingsToPublisher(publisher, {
      frameRate: 15,
      resolution: Resolution.VGA_LANDSCAPE,
      bitrateMode: 'default',
      customVideoBitrate: 500_000,
      contentHint: '' as const,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'applyAdvancedSettingsToPublisher: setPreferredFrameRate failed',
      expect.any(Error)
    );
    expect(publisher.setPreferredResolution).toHaveBeenCalledWith({ width: 640, height: 480 });
    expect(publisher.setVideoBitratePreset).toHaveBeenCalledWith('default');
  });

  it('logs the custom bitrate method name when a custom bitrate update fails', async () => {
    const publisher = createMockPublisher();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    publisher.setMaxVideoBitrate = vi.fn().mockRejectedValue(new Error('bitrate failure'));

    await applyAdvancedSettingsToPublisher(publisher, {
      frameRate: 15,
      resolution: Resolution.VGA_LANDSCAPE,
      bitrateMode: 'custom',
      customVideoBitrate: 750_000,
      contentHint: '' as const,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'applyAdvancedSettingsToPublisher: setMaxVideoBitrate failed',
      expect.any(Error)
    );
  });

  it('logs the preset bitrate method name when a preset bitrate update fails', async () => {
    const publisher = createMockPublisher();
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    publisher.setVideoBitratePreset = vi.fn().mockRejectedValue(new Error('bitrate failure'));

    await applyAdvancedSettingsToPublisher(publisher, {
      frameRate: 15,
      resolution: Resolution.VGA_LANDSCAPE,
      bitrateMode: 'default',
      customVideoBitrate: 500_000,
      contentHint: '' as const,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'applyAdvancedSettingsToPublisher: setVideoBitratePreset failed',
      expect.any(Error)
    );
  });
});
