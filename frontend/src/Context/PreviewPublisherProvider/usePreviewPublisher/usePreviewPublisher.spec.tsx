import { act, waitFor } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { hasMediaProcessorSupport, initPublisher, Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'node:events';
import { defaultAudioDevice, defaultVideoDevice } from '@utils/mockData/device';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import { renderHookWithPreviewPublisher as render } from '@test/helpers/renderWithProviders';
import usePreviewPublisher from './usePreviewPublisher';
import { setupNavigatorMocks } from '@test/setup/setupNavigatorMocks';

vi.mock('@vonage/client-sdk-video');

describe('usePreviewPublisher', () => {
  const mockPublisher = Object.assign(new EventEmitter(), {
    getAudioSource: () => defaultAudioDevice,
    getVideoSource: () => defaultVideoDevice,
    applyVideoFilter: vi.fn(),
    clearVideoFilter: vi.fn(),
  }) as unknown as Publisher;
  const mockedInitPublisher = vi.fn();
  const mockedHasMediaProcessorSupport = vi.fn();

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(vi.fn());

    setupNavigatorMocks();

    (initPublisher as Mock).mockImplementation(mockedInitPublisher);
    (hasMediaProcessorSupport as Mock).mockImplementation(mockedHasMediaProcessorSupport);
  });

  describe('initLocalPublisher', () => {
    it('should call initLocalPublisher', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = render(usePreviewPublisher);

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

      const { result } = render(usePreviewPublisher);
      await result.current.initLocalPublisher();
      expect(console.error).toHaveBeenCalledWith('initPublisher error: ', error);
    });

    it('should apply background high blur when initialized and changed background', async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = render(usePreviewPublisher);
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
      const { result } = render(usePreviewPublisher);
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
    let result: ReturnType<typeof usePreviewPublisher>;
    beforeEach(async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const renderResult = render(usePreviewPublisher);

      result = renderResult.result.current;
      await act(async () => {
        await result.initLocalPublisher();
      });
      (mockPublisher.applyVideoFilter as Mock).mockClear();
      (mockPublisher.clearVideoFilter as Mock).mockClear();
    });

    it('applies low blur filter', async () => {
      await act(async () => {
        await result.changeBackground('low-blur');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundBlur',
        blurStrength: 'low',
      });
    });

    it('applies background replacement with image', async () => {
      await act(async () => {
        await result.changeBackground('bg1.jpg');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundReplacement',
        backgroundImgUrl: expect.stringContaining('bg1.jpg'),
      });
    });

    it('clears video filter for unknown option', async () => {
      await act(async () => {
        await result.changeBackground('none');
      });
    });

    it('logs an error if applyBackgroundFilter rejects', async () => {
      mockPublisher.applyVideoFilter = vi.fn(() => {
        throw new Error('Simulated internal failure');
      });

      const { result: res } = render(usePreviewPublisher);
      await act(async () => {
        await res.current.initLocalPublisher();
        await res.current.changeBackground('low-blur');
      });

      expect(console.error).toHaveBeenCalledWith('Failed to apply background filter.');
    });
  });

  describe('on accessDenied', () => {
    const nativePermissions = globalThis.navigator.permissions;
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

      setupNavigatorMocks({
        permissions: {
          query: mockQuery,
        },
      });
    });

    afterAll(() => {
      Object.defineProperty(globalThis.navigator, 'permissions', {
        writable: true,
        value: nativePermissions,
      });
    });

    it('handles permission denial', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);

      const { result } = render(usePreviewPublisher);

      await act(async () => {
        await result.current.initLocalPublisher();
      });

      expect(result.current.accessStatus).not.toBe(DEVICE_ACCESS_STATUS.REJECTED);

      act(() => {
        emitAccessDeniedError();
      });

      await waitFor(() => {
        expect(result.current.accessStatus).toBe(DEVICE_ACCESS_STATUS.REJECTED);
      });
    });

    it('does not throw on older, unsupported browsers', async () => {
      mockQuery.mockImplementation(() => {
        return Promise.reject(new Error('Whoops'));
      });
      mockedInitPublisher.mockReturnValue(mockPublisher);

      const { result } = render(usePreviewPublisher);

      await act(async () => {
        await result.current.initLocalPublisher();
      });

      expect(emitAccessDeniedError).not.toThrow();

      act(emitAccessDeniedError);

      expect(console.error).toHaveBeenCalledWith('Error querying permissions:', expect.any(Error));
    });
  });
});
