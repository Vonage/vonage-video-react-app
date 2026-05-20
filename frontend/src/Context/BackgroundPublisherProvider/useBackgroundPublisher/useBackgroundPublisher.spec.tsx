import { act, renderHook as renderHookBase, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { hasMediaProcessorSupport, initPublisher, Publisher } from '@vonage/client-sdk-video';
import EventEmitter from 'node:events';
import { defaultAudioDevice, defaultVideoDevice } from '@utils/mockData/device';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import useBackgroundPublisher from './useBackgroundPublisher';
import { DEVICE_ACCESS_STATUS } from '@utils/constants';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

vi.mock('@vonage/client-sdk-video');

describe('useBackgroundPublisher', () => {
  const mockPublisher = Object.assign(new EventEmitter(), {
    getAudioSource: () => defaultAudioDevice,
    getVideoSource: () => defaultVideoDevice,
    applyVideoFilter: vi.fn(),
    clearVideoFilter: vi.fn(),
    setPreferredFrameRate: vi.fn().mockResolvedValue(undefined),
    setPreferredResolution: vi.fn().mockResolvedValue(undefined),
    setMaxVideoBitrate: vi.fn().mockResolvedValue(undefined),
    setVideoBitratePreset: vi.fn().mockResolvedValue(undefined),
  }) as unknown as Publisher;

  const mockedInitPublisher = vi.fn();
  const mockedHasMediaProcessorSupport = vi.fn();

  beforeEach(() => {
    vi.spyOn(console, 'error');

    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve([]),
      },
    });

    const { permissions } = globalThis.navigator;

    vi.spyOn(permissions, 'query').mockResolvedValue({ state: 'granted' } as PermissionStatus);

    (initPublisher as Mock).mockImplementation(mockedInitPublisher);
    (hasMediaProcessorSupport as Mock).mockImplementation(mockedHasMediaProcessorSupport);
  });

  describe('initBackgroundLocalPublisher', () => {
    it('should call initBackgroundLocalPublisher', () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = render();

      act(() => {
        result.current.initBackgroundLocalPublisher();
      });

      expect(mockedInitPublisher).toHaveBeenCalled();
    });

    it('should log access denied errors', () => {
      const error = new Error(
        "It hit me pretty hard, how there's no kind of sad in this world that will stop it turning."
      );
      error.name = 'OT_USER_MEDIA_ACCESS_DENIED';
      (initPublisher as Mock).mockImplementation((_, _args, callback) => {
        callback(error);
      });

      const { result } = render();
      act(() => {
        result.current.initBackgroundLocalPublisher();
      });
      expect(console.error).toHaveBeenCalledWith('initPublisher error: ', error);
    });

    it('should apply background high blur-sm when initialized and changed background', async () => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = render();
      act(() => {
        result.current.initBackgroundLocalPublisher();
      });

      await act(async () => {
        await result.current.changeBackground('high-blur');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundBlur',
        blurStrength: 'high',
      });
    });

    it('should not replace background when initialized if the device does not support it', () => {
      mockedHasMediaProcessorSupport.mockReturnValue(false);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      const { result } = render();
      act(() => {
        result.current.initBackgroundLocalPublisher();
      });
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
    let result: ReturnType<typeof render>['result'];
    beforeEach(() => {
      mockedHasMediaProcessorSupport.mockReturnValue(true);
      mockedInitPublisher.mockReturnValue(mockPublisher);
      result = render().result;
      act(() => {
        result.current.initBackgroundLocalPublisher();
      });
      (mockPublisher.applyVideoFilter as Mock).mockClear();
      (mockPublisher.clearVideoFilter as Mock).mockClear();
    });

    it('applies low blur-sm filter', async () => {
      await act(async () => {
        await result.current.changeBackground('low-blur');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundBlur',
        blurStrength: 'low',
      });
    });

    it('applies background replacement with image', async () => {
      await act(async () => {
        await result.current.changeBackground('bg1.jpg');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundReplacement',
        backgroundImgUrl: expect.stringContaining('bg1.jpg'),
      });
    });

    it('clears video filter for unknown option', async () => {
      await act(async () => {
        await result.current.changeBackground('none');
      });
      expect(mockPublisher.clearVideoFilter).toHaveBeenCalled();
    });

    it('logs an error if applyBackgroundFilter rejects', async () => {
      mockPublisher.applyVideoFilter = vi.fn(() => {
        throw new Error('Simulated internal failure');
      });

      const { result: res } = render();
      await act(async () => {
        res.current.initBackgroundLocalPublisher();
        await res.current.changeBackground('low-blur');
      });

      expect(console.error).toHaveBeenCalledWith('Failed to apply background filter.');
    });
  });

  describe('on accessDenied', () => {
    const mockQuery = vi.fn();
    let mockedPermissionStatus: { onchange: null | (() => void); state: string };
    const emitAccessDeniedError = () => {
      // @ts-expect-error We simulate user denying microphone permissions in a browser.
      mockPublisher.emit('accessDenied', {
        message: 'Microphone permission denied during the call',
      });
    };

    beforeEach(() => {
      mockedPermissionStatus = {
        onchange: null,
        state: 'prompt',
      };
      mockQuery.mockResolvedValue(mockedPermissionStatus);

      const { permissions } = globalThis.navigator;

      vi.spyOn(permissions, 'query').mockImplementation(mockQuery);
    });

    it('handles permission denial', async () => {
      mockedInitPublisher.mockReturnValue(mockPublisher);

      const { result } = render();

      act(() => {
        result.current.initBackgroundLocalPublisher();
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

      const { result } = render();

      act(() => {
        result.current.initBackgroundLocalPublisher();
      });

      expect(emitAccessDeniedError).not.toThrow();

      act(() => {
        emitAccessDeniedError();
      });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Error querying permissions:',
          expect.objectContaining({ message: 'Whoops' })
        );
      });
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  publisherContext?: ProviderOptions['PublisherContext'];
  backgroundPublisherContext?: ProviderOptions['BackgroundPublisherContext'];
};

function render({
  userContext,
  sessionContext,
  publisherContext,
  backgroundPublisherContext,
}: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [
      providers.user,
      providers.session,
      providers.publisher,
      providers.backgroundPublisher,
      providers.runtime,
    ],
    {
      userContext,
      sessionContext,
      publisherContext,
      backgroundPublisherContext,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderHookBase(() => useBackgroundPublisher(), {
      wrapper,
    }),
  };
}
