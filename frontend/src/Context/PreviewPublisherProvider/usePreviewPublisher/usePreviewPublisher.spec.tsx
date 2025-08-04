import { act, cleanup, renderHook } from '@testing-library/react';
import { afterAll, afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { hasMediaProcessorSupport, initPublisher, Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import usePreviewPublisher from './usePreviewPublisher';
import { UserContextType } from '../../user';
import useUserContext from '../../../hooks/useUserContext';
import usePermissions, { PermissionsHookType } from '../../../hooks/usePermissions';
import useDevices from '../../../hooks/useDevices';
import { AllMediaDevices } from '../../../types';
import {
  allMediaDevices,
  defaultAudioDevice,
  defaultVideoDevice,
} from '../../../utils/mockData/device';
import { DEVICE_ACCESS_STATUS } from '../../../utils/constants';

vi.mock('@vonage/client-sdk-video');
vi.mock('../../../hooks/useUserContext.tsx');
vi.mock('../../../hooks/usePermissions.tsx');
vi.mock('../../../hooks/useDevices.tsx');
const mockUseUserContext = useUserContext as Mock<[], UserContextType>;
const mockUsePermissions = usePermissions as Mock<[], PermissionsHookType>;
const mockUseDevices = useDevices as Mock<
  [],
  { allMediaDevices: AllMediaDevices; getAllMediaDevices: () => void }
>;

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

describe('usePreviewPublisher', () => {
  const mockPublisher = Object.assign(new EventEmitter(), {
    getAudioSource: () => defaultAudioDevice,
    getVideoSource: () => defaultVideoDevice,
    applyVideoFilter: vi.fn(),
    clearVideoFilter: vi.fn(),
  }) as unknown as Publisher;
  const mockedInitPublisher = vi.fn();
  const mockedHasMediaProcessorSupport = vi.fn();
  const consoleErrorSpy = vi.spyOn(console, 'error');
  const mockSetAccessStatus = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();
    mockUseUserContext.mockImplementation(() => mockUserContextWithDefaultSettings);
    (initPublisher as Mock).mockImplementation(mockedInitPublisher);
    (hasMediaProcessorSupport as Mock).mockImplementation(mockedHasMediaProcessorSupport);
    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });
    mockUsePermissions.mockReturnValue({
      accessStatus: DEVICE_ACCESS_STATUS.PENDING,
      setAccessStatus: mockSetAccessStatus,
    });
  });

  afterEach(() => {
    cleanup();
  });

  describe('initLocalPublisher', () => {
    it('should call initLocalPublisher', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePreviewPublisher());

      await result.current.initLocalPublisher();

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

      const { result } = renderHook(() => usePreviewPublisher());
      await result.current.initLocalPublisher();
      expect(consoleErrorSpy).toHaveBeenCalledWith('initPublisher error: ', error);
    });

    it('should apply background high blur when initialized and changed background', async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = renderHook(() => usePreviewPublisher());
      await result.current.initLocalPublisher();

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
      const { result } = renderHook(() => usePreviewPublisher());
      await result.current.initLocalPublisher();
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
      result = renderHook(() => usePreviewPublisher()).result;
      await act(async () => {
        await (result.current as ReturnType<typeof usePreviewPublisher>).initLocalPublisher();
      });
      (mockPublisher.applyVideoFilter as Mock).mockClear();
      (mockPublisher.clearVideoFilter as Mock).mockClear();
    });

    it('applies low blur filter', async () => {
      await act(async () => {
        await (result.current as ReturnType<typeof usePreviewPublisher>).changeBackground(
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
        await (result.current as ReturnType<typeof usePreviewPublisher>).changeBackground(
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
        await (result.current as ReturnType<typeof usePreviewPublisher>).changeBackground('none');
      });
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

      const { result } = renderHook(() => usePreviewPublisher());

      act(() => {
        result.current.initLocalPublisher();
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

      const { result } = renderHook(() => usePreviewPublisher());

      act(() => {
        result.current.initLocalPublisher();

        expect(emitAccessDeniedError).not.toThrow();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to query device permission for microphone: Error: Whoops'
      );
    });
  });
});
