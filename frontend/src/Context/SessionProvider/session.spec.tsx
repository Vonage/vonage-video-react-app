import { ReactElement, useEffect } from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, render as renderBase, waitFor } from '@testing-library/react';
import EventEmitter from 'events';
import { Publisher, Stream } from '@vonage/client-sdk-video';
import useSessionContext from '@hooks/useSessionContext';
import ActiveSpeakerTracker from '@utils/ActiveSpeakerTracker';
import VonageVideoClient from '@utils/VonageVideoClient';
import { StreamPropertyChangedEvent, SubscriberWrapper } from '@app-types/session';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import type { VideoClient } from '@core/services';

vi.mock('@utils/ActiveSpeakerTracker');
vi.mock('@utils/VonageVideoClient');

// Override the constants for max pinning test
vi.mock('@utils/constants', () => ({
  MAX_PIN_COUNT_MOBILE: 1,
  MAX_PIN_COUNT_DESKTOP: 1,
}));

vi.mock('@api/fetchCredentials');

const mockJoinSessionMutate = vi.fn();
const mockVideoClient = {
  joinSession: (...args: unknown[]) => mockJoinSessionMutate(...args) as unknown,
} as unknown as VideoClient;

// A valid fake JWT containing sessionId: '1_MX4xMjM0NTY3OH4-VGh1IEZlYiAyNyAwODozMjozNCBQU1QgMjAyMH4wLjI0NDYxMjE'
const validSessionKey =
  'eyJhbGciOiJIUzI1NiJ9.eyJzZXNzaW9uSWQiOiIxX01YNHhNak0wTlRZM09INC1WR2gxSUVabFlpQXlOeUF3T0Rvek1qb3pOQ0JRVTFRZ01qQXlNSDR3TGpJME5EWXhNakUiLCJyb29tTmFtZSI6IlRlc3RDb21wb25lbnRSb29tIn0.fakesig';

describe('SessionProvider', () => {
  let activeSpeakerTracker: ActiveSpeakerTracker;
  let vonageVideoClient: VonageVideoClient;

  const TestComponent = () => {
    const {
      activeSpeakerId,
      publish,
      unpublish,
      joinRoom,
      disconnect,
      subscriberWrappers,
      connected,
      reconnecting,
      archiveId,
      forceMute,
      pinSubscriber,
      isMaxPinned,
      lastStreamUpdate,
    } = useSessionContext();

    useEffect(() => {
      if (joinRoom) {
        void joinRoom({ sessionKey: validSessionKey });
      }
    }, [joinRoom]);

    return (
      <div>
        <button
          data-testid="publish"
          onClick={() => {
            if (publish) {
              void publish({} as unknown as Publisher);
            }
          }}
          type="button"
        >
          Publish
        </button>
        <button
          data-testid="unpublish"
          onClick={() => {
            unpublish({} as unknown as Publisher);
          }}
          type="button"
        >
          Unpublish
        </button>
        <button
          data-testid="disconnect"
          onClick={() => {
            if (disconnect) {
              disconnect();
            }
          }}
          type="button"
        >
          Disconnect
        </button>
        <button
          data-testid="forceMute"
          onClick={() => {
            if (forceMute) {
              void forceMute({} as unknown as Stream);
            }
          }}
          type="button"
        >
          Force Mute
        </button>
        <button
          data-testid="pinSubscriber"
          onClick={() => {
            if (pinSubscriber) {
              pinSubscriber('sub1');
            }
          }}
          type="button"
        >
          Pin Subscriber
        </button>
        <span data-testid="activeSpeaker">{activeSpeakerId}</span>
        <span data-testid="subscriberWrappers">
          {subscriberWrappers.map((subscriberWrapper) => (
            <div key={subscriberWrapper.id}>{subscriberWrapper.id}</div>
          ))}
        </span>
        <span data-testid="connected">{String(connected)}</span>
        <span data-testid="reconnecting">{String(reconnecting)}</span>
        <span data-testid="archiveId">{String(archiveId)}</span>
        <span data-testid="isMaxPinned">{String(isMaxPinned)}</span>
        <span data-testid="streamPropertyChanged">
          {lastStreamUpdate ? JSON.stringify(lastStreamUpdate) : 'No updates'}
        </span>
      </div>
    );
  };

  beforeEach(() => {
    activeSpeakerTracker = Object.assign(new EventEmitter(), {
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

  async function renderAndWaitForConnection() {
    const result = render(<TestComponent />);
    await waitFor(() => expect(result.getByTestId('connected')).toHaveTextContent('true'));
    return result;
  }

  it('should update activeSpeaker state when activeSpeakerTracker emits event', async () => {
    const { getByTestId } = await renderAndWaitForConnection();
    void act(() =>
      activeSpeakerTracker.emit('activeSpeakerChanged', {
        previousActiveSpeaker: { subscriberId: undefined, movingAvg: 0 },
        newActiveSpeaker: { subscriberId: 'sub1', movingAvg: 0.3 },
      })
    );
    await waitFor(() => expect(getByTestId('activeSpeaker')).toHaveTextContent('sub1'));
    void act(() =>
      activeSpeakerTracker.emit('activeSpeakerChanged', {
        previousActiveSpeaker: { subscriberId: 'sub1', movingAvg: 0 },
        newActiveSpeaker: { subscriberId: 'sub2', movingAvg: 0.4 },
      })
    );
    await waitFor(() => expect(getByTestId('activeSpeaker')).toHaveTextContent('sub2'));
  });

  describe('publish', () => {
    it('should call publish on VonageVideoClient when connected', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        getByTestId('publish').click();
      });

      await waitFor(() => {
        expect(vonageVideoClient.publish).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call publish on VonageVideoClient if not connected', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        getByTestId('disconnect').click();
      });

      await waitFor(() => expect(getByTestId('connected')).toHaveTextContent('false'));

      act(() => {
        getByTestId('publish').click();
      });

      expect(vonageVideoClient.publish).toHaveBeenCalledTimes(0);
    });
  });

  describe('unpublish', () => {
    it('should call unpublish on VonageVideoClient', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        getByTestId('unpublish').click();
      });

      await waitFor(() => {
        expect(vonageVideoClient.unpublish).toHaveBeenCalledTimes(1);
      });
    });

    it('should not call unpublish on VonageVideoClient if not connected', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        getByTestId('disconnect').click();
      });

      await waitFor(() => expect(getByTestId('connected')).toHaveTextContent('false'));

      act(() => {
        getByTestId('unpublish').click();
      });

      await waitFor(() => {
        expect(vonageVideoClient.unpublish).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('subscriberWrappers', () => {
    it('adding a new subscriber should add it to the subscriberWrappers', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub1',
        } as unknown as SubscriberWrapper);
      });

      await waitFor(() => {
        expect(getByTestId('subscriberWrappers')).toHaveTextContent('sub1');
      });

      act(() => {
        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub2',
        } as unknown as SubscriberWrapper);
      });

      await waitFor(() => {
        expect(getByTestId('subscriberWrappers')).toHaveTextContent('sub2');
        expect(getByTestId('subscriberWrappers').children.length).toBe(2);
      });
    });

    it('removing a subscriber should remove it from the subscriberWrappers', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub1',
        } as unknown as SubscriberWrapper);
      });

      await waitFor(() => {
        expect(getByTestId('subscriberWrappers')).toHaveTextContent('sub1');
      });

      act(() => {
        vonageVideoClient.hasStream = vi.fn().mockReturnValue(false);
        vonageVideoClient.emit('subscriberDestroyed', 'sub1');
      });

      await waitFor(() => {
        expect(getByTestId('subscriberWrappers')).not.toHaveTextContent('sub1');
      });
    });
  });

  describe('session', () => {
    it('connect should call connect on VonageVideoClient and set connected to true', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      await waitFor(() => expect(getByTestId('connected')).toHaveTextContent('true'));
      expect(vonageVideoClient.connect).toHaveBeenCalledTimes(1);
    });

    it('disconnect should call disconnect on VonageVideoClient and set connected to false', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        getByTestId('disconnect').click();
      });

      await waitFor(() => expect(getByTestId('connected')).toHaveTextContent('false'));
      expect(vonageVideoClient.disconnect).toHaveBeenCalledTimes(1);
    });

    it('when reconnecting session, sets reconnecting to true', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        vonageVideoClient.emit('sessionReconnecting');
      });

      await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('true'));
    });

    it('when reconnected, sets reconnecting to false', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        vonageVideoClient.emit('sessionReconnected');
      });

      await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('false'));
    });

    it('when re-connected, sets reconnecting to false', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        vonageVideoClient.emit('sessionReconnected');
      });

      await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('false'));
    });

    it('when disconnected, sets connected to false', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        vonageVideoClient.emit('sessionDisconnected', { reason: 'test reason' });
      });

      await waitFor(() => expect(getByTestId('connected')).toHaveTextContent('false'));
    });

    it('when a stream property changes, it should update the state', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      const streamPropertyChangedEvent = {
        stream: {
          id: 'stream1',
        } as unknown as Stream,
        changedProperty: 'hasVideo',
        newValue: false,
        oldValue: true,
      } as unknown as StreamPropertyChangedEvent;

      await waitFor(() => {
        expect(getByTestId('streamPropertyChanged')).toHaveTextContent('No updates');
      });

      act(() => {
        vonageVideoClient.emit('streamPropertyChanged', streamPropertyChangedEvent);
      });

      await waitFor(() => {
        expect(getByTestId('streamPropertyChanged')).toHaveTextContent(
          JSON.stringify(streamPropertyChangedEvent)
        );
      });
    });
  });

  describe('archiving', () => {
    it('should set archiveId when archiving starts', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        vonageVideoClient.emit('archiveStarted', 'abc123');
      });

      await waitFor(() => expect(getByTestId('archiveId')).toHaveTextContent('abc123'));
    });

    it('should set archiveId to null when archiving stops', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        vonageVideoClient.emit('archiveStopped');
      });

      await waitFor(() => expect(getByTestId('archiveId')).toHaveTextContent('null'));
    });
  });

  describe('pinning', () => {
    it('should move a pinned subscriber to the top of the list', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub1',
        } as unknown as SubscriberWrapper);
      });

      act(() => {
        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub2',
        } as unknown as SubscriberWrapper);
        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub3',
        } as unknown as SubscriberWrapper);
      });

      await waitFor(() => expect(getByTestId('subscriberWrappers').children.length).toBe(3));
      expect(getByTestId('subscriberWrappers').children[0]).not.toHaveTextContent('sub1');

      act(() => {
        getByTestId('pinSubscriber').click();
      });

      expect(getByTestId('subscriberWrappers').children[0]).toHaveTextContent('sub1');
    });

    it('pinning the maximum number of subscribers should set isMaxPinned to true', async () => {
      const { getByTestId } = await renderAndWaitForConnection();

      act(() => {
        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub1',
        } as unknown as SubscriberWrapper);

        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub2',
        } as unknown as SubscriberWrapper);

        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub3',
        } as unknown as SubscriberWrapper);

        getByTestId('pinSubscriber').click();
      });

      await waitFor(() => expect(getByTestId('isMaxPinned')).toHaveTextContent('true'));
    });
  });

  it('forceMute should call forceMute on VonageVideoClient', async () => {
    const { getByTestId } = await renderAndWaitForConnection();

    act(() => {
      getByTestId('forceMute').click();
    });

    await waitFor(() => expect(vonageVideoClient.forceMuteStream).toHaveBeenCalledTimes(1));
  });

  it('joinRoom should call joinSession and connect', async () => {
    await renderAndWaitForConnection();

    await waitFor(() => {
      expect(mockJoinSessionMutate).toHaveBeenCalledTimes(1);
      expect(vonageVideoClient.connect).toHaveBeenCalledTimes(1);
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
