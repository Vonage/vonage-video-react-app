import { act, cleanup, renderHook } from '@testing-library/react';
import { afterAll, afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { hasMediaProcessorSupport, initPublisher, Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import useBackgroundPublisher from './useBackgroundPublisher';
import { UserContextType } from '../../user';
import useUserContext from '../../../hooks/useUserContext';
import usePermissions from '../../../hooks/usePermissions';
import useDevices from '../../../hooks/useDevices';
import {
  allMediaDevices,
  defaultAudioDevice,
  defaultVideoDevice,
} from '../../../utils/mockData/device';
import { DEVICE_ACCESS_STATUS } from '../../../utils/constants';
import usePublisherOptions from '../../PublisherProvider/usePublisherOptions';

vi.mock('@vonage/client-sdk-video');
vi.mock('../../../hooks/useUserContext.tsx');
vi.mock('../../../hooks/usePermissions.tsx');
vi.mock('../../../hooks/useDevices.tsx');
vi.mock('../../PublisherProvider/usePublisherOptions');

const defaultSettings = {
  publishAudio: false,
  publishVideo: false,
  name: '',
  noiseSuppression: true,
  publishCaptions: false,
};
const mockUserContextWithDefaultSettings = {
  user: {
    defaultSettings,
    issues: { reconnections: 0, audioFallbacks: 0 },
  },
  setUser: vi.fn(),
} as UserContextType;

describe('useBackgroundPublisher', () => {
  const mockPublisher = Object.assign(new EventEmitter(), {
    getAudioSource: () => defaultAudioDevice,
    getVideoSource: () => defaultVideoDevice,
    applyVideoFilter: vi.fn(),
    clearVideoFilter: vi.fn(),
  }) as unknown as Publisher;

  const mockedInitPublisher = vi.fn();
  const mockedHasMediaProcessorSupport = vi.fn();
  const mockSetAccessStatus = vi.fn();

  beforeEach(() => {
    vi.spyOn(console, 'error');
    vi.mocked(useUserContext).mockImplementation(() => mockUserContextWithDefaultSettings);
    (initPublisher as Mock).mockImplementation(mockedInitPublisher);
    (hasMediaProcessorSupport as Mock).mockImplementation(mockedHasMediaProcessorSupport);
    vi.mocked(useDevices).mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });
    vi.mocked(usePermissions).mockReturnValue({
      accessStatus: DEVICE_ACCESS_STATUS.PENDING,
      setAccessStatus: mockSetAccessStatus,
    });
    vi.mocked(usePublisherOptions).mockReturnValue({
      publishVideo: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('initBackgroundLocalPublisher', () => {
    it('should call initBackgroundLocalPublisher', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => useBackgroundPublisher());

      await result.current.initBackgroundLocalPublisher();

      expect(mockedInitPublisher).toHaveBeenCalled();
    });

    it('should log access denied errors', async () => {
      const error = new Error(
        "It hit me pretty hard, how there's no kind of sad in this world that will stop it turning."
      );
      error.name = 'OT_USER_MEDIA_ACCESS_DENIED';
      (initPublisher as Mock).mockImplementation((_, _args, callback) => {
        callback(error);
      });

      const { result } = renderHook(() => useBackgroundPublisher());
      await result.current.initBackgroundLocalPublisher();
      expect(console.error).toHaveBeenCalledWith('initPublisher error: ', error);
    });

    it('should apply background high blur when initialized and changed background', async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => useBackgroundPublisher());
      await result.current.initBackgroundLocalPublisher();

      await act(async () => {
        await result.current.changeBackground('high-blur');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundBlur',
        blurStrength: 'high',
      });
    });

    it('should not replace background when initialized if the device does not support it', async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(false);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => useBackgroundPublisher());
      await result.current.initBackgroundLocalPublisher();
      expect(mockedInitPublisher).toHaveBeenCalledWith(
        undefined,
        expect.objectContaining({
          videoFilter: undefined,
        }),
        expect.any(Function)
      );
    });
  });

  describe('changeBackground', () => {
    let result: ReturnType<typeof renderHook>['result'];
    beforeEach(async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      result = renderHook(() => useBackgroundPublisher()).result;
      await act(async () => {
        await (
          result.current as ReturnType<typeof useBackgroundPublisher>
        ).initBackgroundLocalPublisher();
      });
      (mockPublisher.applyVideoFilter as Mock).mockClear();
      (mockPublisher.clearVideoFilter as Mock).mockClear();
    });

    it('applies low blur filter', async () => {
      await act(async () => {
        await (result.current as ReturnType<typeof useBackgroundPublisher>).changeBackground(
          'low-blur'
        );
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundBlur',
        blurStrength: 'low',
      });
    });

    it('applies background replacement with image', async () => {
      await act(async () => {
        await (result.current as ReturnType<typeof useBackgroundPublisher>).changeBackground(
          'bg1.jpg'
        );
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundReplacement',
        backgroundImgUrl: expect.stringContaining('bg1.jpg'),
      });
    });

    it('clears video filter for unknown option', async () => {
      await act(async () => {
        await (result.current as ReturnType<typeof useBackgroundPublisher>).changeBackground(
          'none'
        );
      });
    });

    it('logs an error if applyBackgroundFilter rejects', async () => {
      mockPublisher.applyVideoFilter = vi.fn(() => {
        throw new Error('Simulated internal failure');
      });

      const { result: res } = renderHook(() => useBackgroundPublisher());
      await act(async () => {
        await res.current.initBackgroundLocalPublisher();
        await res.current.changeBackground('low-blur');
      });

      expect(console.error).toHaveBeenCalledWith('Failed to apply background filter.');
    });
  });

  describe('on accessDenied', () => {
    const nativePermissions = global.navigator.permissions;
    const mockQuery = vi.fn();
    let mockedPermissionStatus: { onchange: null | (() => void); status: string };
    const emitAccessDeniedError = () => {
      // @ts-expect-error We simulate user denying microphone permissions in a browser.
      mockPublisher.emit('accessDenied', {
        message: 'Microphone permission denied during the call',
      });
    };

    beforeEach(() => {
      mockedPermissionStatus = {
        onchange: null,
        status: 'prompt',
      };
      mockQuery.mockResolvedValue(mockedPermissionStatus);

      Object.defineProperty(global.navigator, 'permissions', {
        writable: true,
        value: {
          query: mockQuery,
        },
      });
    });

    afterAll(() => {
      Object.defineProperty(global.navigator, 'permissions', {
        writable: true,
        value: nativePermissions,
      });
    });

    it('handles permission denial', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);

      const { result } = renderHook(() => useBackgroundPublisher());

      act(() => {
        result.current.initBackgroundLocalPublisher();
      });
      expect(result.current.accessStatus).toBe(DEVICE_ACCESS_STATUS.PENDING);

      act(emitAccessDeniedError);

      expect(mockSetAccessStatus).toBeCalledWith(DEVICE_ACCESS_STATUS.REJECTED);
    });

    it('does not throw on older, unsupported browsers', async () => {
      mockQuery.mockImplementation(() => {
        throw new Error('Whoops');
      });
      mockedInitPublisher.mockReturnValue(mockPublisher);

      const { result } = renderHook(() => useBackgroundPublisher());

      act(() => {
        result.current.initBackgroundLocalPublisher();

        expect(emitAccessDeniedError).not.toThrow();
      });

      expect(console.error).toHaveBeenCalledWith(
        'Failed to query device permission for microphone: Error: Whoops'
      );
    });
  });
});
