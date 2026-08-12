import { ReactElement, useEffect } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, render as renderBase, waitFor } from '@testing-library/react';
import EventEmitter from 'events';
import useSessionContext from '@hooks/useSessionContext';
import ActiveSpeakerTracker from '@utils/ActiveSpeakerTracker';
import VonageVideoClient from '@utils/VonageVideoClient';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import type { VideoClient } from '@core/services';

vi.mock('@utils/ActiveSpeakerTracker');
vi.mock('@utils/VonageVideoClient');

vi.mock('@api/fetchCredentials');

const mockJoinSessionMutate = vi.fn();
const mockVideoClient = {
  joinSession: (...args: unknown[]) => mockJoinSessionMutate(...args) as unknown,
  startArchive: vi.fn().mockResolvedValue({ id: 'new-archive-id' }),
} as unknown as VideoClient;

// A valid fake JWT containing sessionId
const validSessionKey =
  'eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uSWQiOiIxX01YNHhNak0wTlRZM09INC1WR2gxSUVabFlpQXlOeUF3T0Rvek1qb3pOQ0JRVTFRZ01qQXlNSDR3TGpJME5EWXhNakUiLCJyb29tTmFtZSI6IlRlc3RDb21wb25lbnRSb29tIn0.fakesig';

describe('SessionProvider — session migration archiving recovery', () => {
  let vonageVideoClient: VonageVideoClient;

  const TestComponent = () => {
    const {
      joinRoom,
      connected,
      reconnecting,
      archiveId,
      archiveIdStartedBySelf,
      markArchiveStartRequestedBySelf,
    } = useSessionContext();

    useEffect(() => {
      if (joinRoom) {
        void joinRoom({ sessionKey: validSessionKey });
      }
    }, [joinRoom]);

    return (
      <div>
        <button
          data-testid="markInitiator"
          onClick={() => markArchiveStartRequestedBySelf()}
          type="button"
        >
          Mark Initiator
        </button>
        <span data-testid="connected">{String(connected)}</span>
        <span data-testid="reconnecting">{String(reconnecting)}</span>
        <span data-testid="archiveId">{String(archiveId)}</span>
        <span data-testid="archiveIdStartedBySelf">{String(archiveIdStartedBySelf)}</span>
      </div>
    );
  };

  beforeEach(() => {
    const activeSpeakerTracker = Object.assign(new EventEmitter(), {
      onSubscriberDestroyed: vi.fn(),
      onSubscriberAudioLevelUpdated: vi.fn(),
    }) as unknown as ActiveSpeakerTracker;

    vonageVideoClient = Object.assign(new EventEmitter(), {
      unpublish: vi.fn(),
      publish: vi.fn().mockResolvedValue(undefined),
      connect: vi.fn().mockReturnValue(Promise.resolve()),
      disconnect: vi.fn(),
      forceMuteStream: vi.fn(),
      hasStream: vi.fn().mockReturnValue(true),
      resubscribeToStreamId: vi.fn().mockResolvedValue(undefined),
      emitSubscriberDestroyedOnce: vi.fn(),
    }) as unknown as VonageVideoClient;

    const mockedActiveSpeakerTracker = vi.mocked(ActiveSpeakerTracker);

    mockedActiveSpeakerTracker.mockImplementation(() => {
      return activeSpeakerTracker;
    });

    const mockedVonageVideoClient = vi.mocked(VonageVideoClient);

    mockedVonageVideoClient.mockImplementation(() => {
      return vonageVideoClient;
    });

    mockJoinSessionMutate.mockResolvedValue({
      token: 'token',
      sessionId: 'sessionId',
      sessionKey: validSessionKey,
    });
  });

  async function renderAndWaitForConnection(options: RenderOptions = {}) {
    const result = render(<TestComponent />, options);
    await waitFor(() => expect(result.getByTestId('connected')).toHaveTextContent('true'));
    return result;
  }

  it('sets reconnecting to true when sessionReconnecting fires', async () => {
    const { getByTestId } = await renderAndWaitForConnection();

    act(() => {
      vonageVideoClient.emit('sessionReconnecting');
    });

    await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('true'));
  });

  it('resets reconnecting when sessionReconnected fires', async () => {
    const { getByTestId } = await renderAndWaitForConnection();

    act(() => {
      vonageVideoClient.emit('sessionReconnecting');
    });

    await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('true'));

    act(() => {
      vonageVideoClient.emit('sessionReconnected');
    });

    await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('false'));
  });

  it('does not restart the archive from the client — the backend owns that responsibility', async () => {
    const { getByTestId } = await renderAndWaitForConnection();

    act(() => {
      vonageVideoClient.emit('sessionReconnecting');
    });

    await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('true'));

    act(() => {
      vonageVideoClient.emit('sessionReconnected');
    });

    await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('false'));

    expect(mockVideoClient.startArchive).not.toHaveBeenCalled();
  });

  describe('server rotation consent suppression', () => {
    it('archiveIdStartedBySelf is set when archive starts and user clicked markArchiveStartRequestedBySelf', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        getByTestId('markInitiator').click();
      });

      act(() => {
        vonageVideoClient.emit('archiveStarted', 'archive-001');
      });

      await waitFor(() =>
        expect(getByTestId('archiveIdStartedBySelf')).toHaveTextContent('archive-001')
      );
    });

    it('after server rotation, archiveIdStartedBySelf is restored with new archiveId for the initiator', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      // Mark this client as the archive initiator and start the archive
      act(() => {
        getByTestId('markInitiator').click();
      });

      act(() => {
        vonageVideoClient.emit('archiveStarted', 'archive-001');
      });

      await waitFor(() =>
        expect(getByTestId('archiveIdStartedBySelf')).toHaveTextContent('archive-001')
      );

      // Simulate server rotation: reconnecting → archiveStopped → archiveStarted
      act(() => {
        vonageVideoClient.emit('sessionReconnecting');
      });

      await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('true'));

      act(() => {
        vonageVideoClient.emit('archiveStopped');
      });

      await waitFor(() => expect(getByTestId('archiveIdStartedBySelf')).toHaveTextContent('null'));

      act(() => {
        vonageVideoClient.emit('archiveStarted', 'archive-002');
      });

      // wasArchiveInitiatorRef was preserved during the rotation, so archiveIdStartedBySelf is restored
      await waitFor(() =>
        expect(getByTestId('archiveIdStartedBySelf')).toHaveTextContent('archive-002')
      );
    });

    it('after server rotation, archiveIdStartedBySelf is NOT set for a non-initiator client', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      // No markInitiator click — this client never initiated the archive
      act(() => {
        vonageVideoClient.emit('sessionReconnecting');
      });

      await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('true'));

      act(() => {
        vonageVideoClient.emit('archiveStopped');
      });

      act(() => {
        vonageVideoClient.emit('archiveStarted', 'archive-002');
      });

      // wasArchiveInitiatorRef was false, so archiveIdStartedBySelf stays null
      await waitFor(() => expect(getByTestId('archiveIdStartedBySelf')).toHaveTextContent('null'));
    });

    it('after manual archive stop (no reconnecting), archiveIdStartedBySelf is NOT restored', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      // Mark as initiator and start archive
      act(() => {
        getByTestId('markInitiator').click();
      });

      act(() => {
        vonageVideoClient.emit('archiveStarted', 'archive-001');
      });

      await waitFor(() =>
        expect(getByTestId('archiveIdStartedBySelf')).toHaveTextContent('archive-001')
      );

      // Manual stop — no sessionReconnecting emitted first, so reconnectingRef = false
      act(() => {
        vonageVideoClient.emit('archiveStopped');
      });

      await waitFor(() => expect(getByTestId('archiveIdStartedBySelf')).toHaveTextContent('null'));

      // New archive starts — wasArchiveInitiatorRef was NOT set (manual stop), so no restoration
      act(() => {
        vonageVideoClient.emit('archiveStarted', 'archive-002');
      });

      await waitFor(() => expect(getByTestId('archiveIdStartedBySelf')).toHaveTextContent('null'));
    });
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
};

function render(ui: ReactElement, { userContext, sessionContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      userContext: {
        ...userContext,
        value: {
          defaultSettings: {
            publishAudio: false,
            publishVideo: false,
            name: '',
            noiseSuppression: true,
            publishCaptions: false,
            ...userContext?.value?.defaultSettings,
          },
        },
      },
      sessionContext,
      runtimeContext: { videoClient: mockVideoClient },
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
