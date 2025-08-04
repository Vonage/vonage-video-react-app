import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { EventEmitter } from 'stream';
import { Publisher, hasMediaProcessorSupport } from '@vonage/client-sdk-video';
import { BACKGROUNDS_PATH } from '../../constants';
import { STORAGE_KEYS, setStorageItem } from '../../storage';
import applyBackgroundFilter from './applyBackgroundFilter';
import { defaultAudioDevice, defaultVideoDevice } from '../../mockData/device';

vi.mock('@vonage/client-sdk-video');
vi.mock('../../storage', () => ({
  setStorageItem: vi.fn(),
  STORAGE_KEYS: { BACKGROUND_REPLACEMENT: 'background_replacement' },
}));

describe('applyBackgroundFilter', () => {
  const mockPublisher = Object.assign(new EventEmitter(), {
    getAudioSource: () => defaultAudioDevice,
    getVideoSource: () => defaultVideoDevice,
    applyVideoFilter: vi.fn(),
    clearVideoFilter: vi.fn(),
  }) as unknown as Publisher;
  beforeEach(() => {
    vi.resetAllMocks();
    (hasMediaProcessorSupport as Mock).mockImplementation(vi.fn().mockReturnValue(true));
  });

  it('does nothing if publisher is not provided', async () => {
    await applyBackgroundFilter(null, 'low-blur');
    expect(setStorageItem).not.toHaveBeenCalled();
  });

  it('applies low blur filter', async () => {
    await applyBackgroundFilter(mockPublisher, 'low-blur');

    expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
      type: 'backgroundBlur',
      blurStrength: 'low',
    });

    expect(setStorageItem).toHaveBeenCalledWith(
      STORAGE_KEYS.BACKGROUND_REPLACEMENT,
      JSON.stringify({
        type: 'backgroundBlur',
        blurStrength: 'low',
      })
    );
  });

  it('applies high blur filter', async () => {
    await applyBackgroundFilter(mockPublisher, 'high-blur');

    expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
      type: 'backgroundBlur',
      blurStrength: 'high',
    });

    expect(setStorageItem).toHaveBeenCalledWith(
      STORAGE_KEYS.BACKGROUND_REPLACEMENT,
      JSON.stringify({
        type: 'backgroundBlur',
        blurStrength: 'high',
      })
    );
  });

  it('applies background replacement filter with an image', async () => {
    const filename = 'background.jpg';
    await applyBackgroundFilter(mockPublisher, filename);

    expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
      type: 'backgroundReplacement',
      backgroundImgUrl: `${BACKGROUNDS_PATH}/${filename}`,
    });

    expect(setStorageItem).toHaveBeenCalledWith(
      STORAGE_KEYS.BACKGROUND_REPLACEMENT,
      JSON.stringify({
        type: 'backgroundReplacement',
        backgroundImgUrl: `${BACKGROUNDS_PATH}/${filename}`,
      })
    );
  });

  it('clears the filter if backgroundSelected does not match any filter', async () => {
    await applyBackgroundFilter(mockPublisher, 'none');

    expect(mockPublisher.clearVideoFilter).toHaveBeenCalled();

    expect(setStorageItem).toHaveBeenCalledWith(
      STORAGE_KEYS.BACKGROUND_REPLACEMENT,
      JSON.stringify('')
    );
  });

  it('calls setBackgroundFilter with the applied filter', async () => {
    const setBackgroundFilter = vi.fn();

    await applyBackgroundFilter(mockPublisher, 'low-blur', undefined, setBackgroundFilter);

    expect(setBackgroundFilter).toHaveBeenCalledWith({
      type: 'backgroundBlur',
      blurStrength: 'low',
    });
  });

  it('calls setUser with the applied filter when storeItem is true', async () => {
    const setUser = vi.fn();

    await applyBackgroundFilter(mockPublisher, 'low-blur', setUser);

    expect(setUser).toHaveBeenCalled();
    const updater = setUser.mock.calls[0][0];
    const prevUser = { defaultSettings: {} };
    const newUser = updater(prevUser);
    expect(newUser.defaultSettings.backgroundFilter).toEqual({
      type: 'backgroundBlur',
      blurStrength: 'low',
    });
  });
});
