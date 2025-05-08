import { beforeEach, describe, it, expect, vi, Mock, afterAll } from 'vitest';
import { act, renderHook } from '@testing-library/react';
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
  blur: false,
  noiseSuppression: true,
};
const mockUserContextWithDefaultSettings = {
  user: {
    defaultSettings,
  },
} as UserContextType;
const mockStream = {
  streamId: 'stream-id',
  name: 'Jane Doe',
} as unknown as Stream;

describe('usePublisher', () => {
  const destroySpy = vi.fn();
  const mockPublisher = Object.assign(new EventEmitter(), {
    destroy: destroySpy,
  }) as unknown as Publisher;
  let sessionContext: SessionContextType;
  const mockedInitPublisher = vi.fn();
  const mockedSessionPublish = vi.fn();
  const mockedSessionUnpublish = vi.fn();
  const consoleWarnSpy = vi.spyOn(console, 'warn');

  beforeEach(() => {
    vi.resetAllMocks();

    mockUseUserContext.mockImplementation(() => mockUserContextWithDefaultSettings);

    (initPublisher as Mock).mockImplementation(mockedInitPublisher);

    sessionContext = {
      publish: mockedSessionPublish,
      unpublish: mockedSessionUnpublish,
      connected: true,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContext);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('initializeLocalPublisher', () => {
    it('should call initPublisher', () => {
      const { result } = renderHook(() => usePublisher());
      act(() => {
        result.current.initializeLocalPublisher({});
      });

      expect(mockedInitPublisher).toHaveBeenCalled();
    });

    it('should log errors', () => {
      (initPublisher as Mock).mockImplementation(() => {
        throw new Error('The second mouse gets the cheese.');
      });

      const { result } = renderHook(() => usePublisher());
      act(() => {
        result.current.initializeLocalPublisher({});
      });

      expect(consoleWarnSpy).toHaveBeenCalled();
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
      expect(mockedSessionUnpublish).toHaveBeenCalled();
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

      expect(consoleWarnSpy).toHaveBeenCalled();
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

  it('should set publishingError and destroy publisher when receiving an accessDenied event', () => {
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

    expect(result.current.publishingError).toEqual({
      header: 'Camera access is denied',
      caption:
        "It seems your browser is blocked from accessing your camera. Reset the permission state through your browser's UI.",
    });
    expect(destroySpy).toHaveBeenCalled();
    expect(result.current.publisher).toBeNull();
  });

  it('should not set publishingError when receiving an accessAllowed event', () => {
    (initPublisher as Mock).mockImplementation(() => mockPublisher);
    const { result } = renderHook(() => usePublisher());

    act(() => {
      result.current.initializeLocalPublisher({});

      // @ts-expect-error We simulate allowing camera and microphone permissions in a browser.
      mockPublisher.emit('accessAllowed');
    });

    expect(result.current.publishingError).toBeNull();
    expect(result.current.publisher).toBe(mockPublisher);
  });
});
