import { beforeEach, describe, it, expect, vi, Mock, afterAll, Mocked } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { initPublisher, Session, Stream } from '@vonage/client-sdk-video';
import EventEmitter from 'events';
import usePublisher from './usePublisher';
import useUserContext from '../../../hooks/useUserContext';
import { UserContextType } from '../../user';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../SessionProvider/session';

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
  const mockPublisher = new EventEmitter();
  let sessionContext: SessionContextType;
  let sessionMock: Mocked<Session>;
  const mockedInitPublisher = vi.fn();
  const mockedSessionPublish = vi.fn();
  const mockedSessionUnpublish = vi.fn();
  const consoleWarnSpy = vi.spyOn(console, 'warn');

  beforeEach(() => {
    vi.resetAllMocks();

    mockUseUserContext.mockImplementation(() => mockUserContextWithDefaultSettings);

    (initPublisher as Mock).mockImplementation(mockedInitPublisher);

    sessionMock = {
      publish: mockedSessionPublish,
      unpublish: mockedSessionUnpublish,
    } as unknown as Mocked<Session>;
    sessionContext = {
      session: sessionMock,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  describe('initializeLocalPublisher', () => {
    it('should call initPublisher', () => {
      const { result } = renderHook(() => usePublisher());
      act(() => {
        result.current.initializeLocalPublisher();
      });

      expect(mockedInitPublisher).toHaveBeenCalled();
    });

    it('should log errors', () => {
      (initPublisher as Mock).mockImplementation(() => {
        throw new Error('The second mouse gets the cheese.');
      });

      const { result } = renderHook(() => usePublisher());
      act(() => {
        result.current.initializeLocalPublisher();
      });

      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('unpublish', () => {
    it('should unpublish when requested', async () => {
      (initPublisher as Mock).mockImplementation(() => mockPublisher);

      const { result, rerender } = renderHook(() => usePublisher());

      result.current.initializeLocalPublisher();
      rerender();
      await result.current.publish();

      await result.current.unpublish();
      expect(mockedSessionUnpublish).toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should publish to the session', async () => {
      (initPublisher as Mock).mockImplementation(() => mockPublisher);

      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher();
      });

      await act(async () => {
        await result.current.publish();
      });

      expect(mockedSessionPublish).toHaveBeenCalled();
    });

    it('should log errors', async () => {
      sessionMock = {
        publish: vi.fn(() => {
          throw new Error('There is an error.');
        }),
      } as unknown as Mocked<Session>;

      const { result } = renderHook(() => usePublisher());
      result.current.initializeLocalPublisher();
      await result.current.publish();

      expect(consoleWarnSpy).toHaveBeenCalled();
    });

    it('should only publish to session once', async () => {
      (initPublisher as Mock).mockImplementation(() => mockPublisher);
      mockedSessionPublish.mockImplementation((_, callback) => {
        callback();
      });

      const { result } = renderHook(() => usePublisher());

      act(() => {
        result.current.initializeLocalPublisher();
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
        result.current.initializeLocalPublisher();
      });

      await act(async () => {
        await result.current.publish();
      });

      expect(result.current.isPublishingError).toEqual(true);
      expect(mockedSessionPublish).toHaveBeenCalledTimes(2);
    });
  });
});
