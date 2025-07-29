import { beforeEach, describe, it, expect, vi, Mock, afterAll } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { initPublisher, Publisher, Stream } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import usePublisher from './usePublisher';
import useUserContext from '../../../hooks/useUserContext';
import { UserContextType } from '../../user';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../SessionProvider/session';
import { PUBLISHING_BLOCKED_CAPTION } from '../../../utils/constants';

vi.mock('@vonage/client-sdk-video');
vi.mock('../../../hooks/useUserContext.tsx');
vi.mock('../../../hooks/useSessionContext.tsx');

const mockUseUserContext = useUserContext as Mock<[], UserContextType>;
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

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
const mockStream = {
  streamId: 'stream-id',
  name: 'Jane Doe',
} as unknown as Stream;

describe('usePublisher', () => {
  const destroySpy = vi.fn();
  const mockPublisher = Object.assign(new EventEmitter(), {
    destroy: destroySpy,
    applyVideoFilter: vi.fn(),
    clearVideoFilter: vi.fn(),
  }) as unknown as Publisher;
  let mockSessionContext: SessionContextType;
  const mockedInitPublisher = vi.fn();
  const mockedSessionPublish = vi.fn();
  const mockedSessionUnpublish = vi.fn();
  const consoleWarnSpy = vi.spyOn(console, 'warn');

  beforeEach(() => {
    vi.resetAllMocks();

    mockUseUserContext.mockImplementation(() => mockUserContextWithDefaultSettings);

    (initPublisher as Mock).mockImplementation(mockedInitPublisher);

    mockSessionContext = {
      publish: mockedSessionPublish,
      unpublish: mockedSessionUnpublish,
      connected: true,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(mockSessionContext);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('initializeLocalPublisher', () => {
    it('should call initPublisher', async () => {
      const { result } = renderHook(() => usePublisher());
      act(() => {
        result.current.initializeLocalPublisher({});
      });

      await waitFor(() => {
        expect(mockedInitPublisher).toHaveBeenCalled();
      });
    });

    it('should log errors', async () => {
      (initPublisher as Mock).mockImplementation(() => {
        throw new Error('The second mouse gets the cheese.');
      });

      const { result } = renderHook(() => usePublisher());
      act(() => {
        result.current.initializeLocalPublisher({});
      });

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalled();
      });
    });
  });

  describe('unpublish', () => {
    it('should unpublish when requested', async () => {
      (initPublisher as Mock).mockImplementation(() => mockPublisher);

      const { result, rerender } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      rerender();

      await act(async () => {
        await result.current.publish();
        result.current.unpublish();
      });

      await waitFor(() => {
        expect(mockedSessionUnpublish).toHaveBeenCalled();
      });
    });
  });

  describe('changeBackground', () => {
    let result: ReturnType<typeof renderHook>['result'];
    beforeEach(async () => {
      (initPublisher as Mock).mockImplementation(() => mockPublisher);
      result = renderHook(() => usePublisher()).result;
      await act(async () => {
        await (result.current as ReturnType<typeof usePublisher>).initializeLocalPublisher({});
      });
      (mockPublisher.applyVideoFilter as Mock).mockClear();
      (mockPublisher.clearVideoFilter as Mock).mockClear();
    });

    it('applies low blur filter', async () => {
      await act(async () => {
        await (result.current as ReturnType<typeof usePublisher>).changeBackground('low-blur');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundBlur',
        blurStrength: 'low',
      });
    });

    it('applies background replacement with image', async () => {
      await act(async () => {
        await (result.current as ReturnType<typeof usePublisher>).changeBackground('bg1.jpg');
      });
      expect(mockPublisher.applyVideoFilter).toHaveBeenCalledWith({
        type: 'backgroundReplacement',
        backgroundImgUrl: expect.stringContaining('bg1.jpg'),
      });
    });

    it('clears video filter for unknown option', async () => {
      await act(async () => {
        await (result.current as ReturnType<typeof usePublisher>).changeBackground('none');
      });
      expect(mockPublisher.clearVideoFilter).toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should publish to the session', async () => {
      (initPublisher as Mock).mockImplementation(() => mockPublisher);

      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      await act(async () => {
        await result.current.publish();
      });

      expect(mockedSessionPublish).toHaveBeenCalled();
    });

    it('should log errors', async () => {
      mockedSessionPublish.mockImplementation(() => {
        throw new Error('There is an error.');
      });

      const { result } = renderHook(() => usePublisher());

      await act(async () => {
        result.current.initializeLocalPublisher({});
        await result.current.publish();
      });

      await waitFor(() => {
        expect(consoleWarnSpy).toHaveBeenCalled();
      });
    });

    it('should only publish to session once', async () => {
      (initPublisher as Mock).mockImplementation(() => mockPublisher);

      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
        // @ts-expect-error We simulate the publisher stream being created.
        mockPublisher.emit('streamCreated', { stream: mockStream });
      });
      expect(initPublisher).toHaveBeenCalledOnce();

      expect(result.current.isPublishing).toEqual(true);
      act(() => {
        // Normally this is async, but it was being called twice in a useEffect hook.
        // To accurately test this, let's call it without await.
        result.current.publish();
      });
      await act(async () => {
        await result.current.publish();
      });

      expect(mockedSessionPublish).toHaveBeenCalledOnce();
    });

    it('should attempt to publish only twice before failing', async () => {
      (initPublisher as Mock).mockImplementation(() => mockPublisher);
      mockedSessionPublish.mockImplementation((_, callback) => {
        callback(new Error('Mocked error'));
      });
      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher({});
      });

      await act(async () => {
        await result.current.publish();
      });

      const publishingBlockedError = {
        header: 'Difficulties joining room',
        caption: PUBLISHING_BLOCKED_CAPTION,
      };
      expect(result.current.publishingError).toEqual(publishingBlockedError);
      expect(mockedSessionPublish).toHaveBeenCalledTimes(2);
    });
  });

  it('should set publishingError and destroy publisher when receiving an accessDenied event', async () => {
    (initPublisher as Mock).mockImplementation(() => mockPublisher);
    const { result } = renderHook(() => usePublisher());

    act(() => {
      result.current.initializeLocalPublisher({});
    });

    expect(result.current.publishingError).toBeNull();

    act(() => {
      // @ts-expect-error We simulate user denying microphone permissions in a browser.
      mockPublisher.emit('accessDenied', {
        message: 'microphone permission denied during the call',
      });
    });

    await waitFor(() => {
      expect(result.current.publishingError).toEqual({
        header: 'Camera access is denied',
        caption:
          "It seems your browser is blocked from accessing your camera. Reset the permission state through your browser's UI.",
      });
      expect(destroySpy).toHaveBeenCalled();
      expect(result.current.publisher).toBeNull();
    });
  });

  it('should not set publishingError when receiving an accessAllowed event', async () => {
    (initPublisher as Mock).mockImplementation(() => mockPublisher);
    const { result } = renderHook(() => usePublisher());

    act(() => {
      result.current.initializeLocalPublisher({});

      // @ts-expect-error We simulate allowing camera and microphone permissions in a browser.
      mockPublisher.emit('accessAllowed');
    });

    await waitFor(() => {
      expect(result.current.publishingError).toBeNull();
      expect(result.current.publisher).toBe(mockPublisher);
    });
  });
});
