import { useEffect } from 'react';
import { describe, expect, it, vi, beforeEach, Mock, afterAll, afterEach } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import EventEmitter from 'events';
import { Publisher, Stream } from '@vonage/client-sdk-video';
import useSessionContext from '../../hooks/useSessionContext';
import SessionProvider from './session';
import ActiveSpeakerTracker from '../../utils/ActiveSpeakerTracker';
import useUserContext from '../../hooks/useUserContext';
import VonageVideoClient from '../../utils/VonageVideoClient';
import { Credential, StreamPropertyChangedEvent, SubscriberWrapper } from '../../types/session';
import fetchCredentials from '../../api/fetchCredentials';

vi.mock('../../utils/ActiveSpeakerTracker');
vi.mock('../../hooks/useUserContext');
vi.mock('../../utils/VonageVideoClient');
// Override the constants for max pinning test
vi.mock('../../utils/constants', () => ({
  MAX_PIN_COUNT_MOBILE: 1,
  MAX_PIN_COUNT_DESKTOP: 1,
}));
vi.mock('../../api/fetchCredentials');
vi.mock('../../hooks/useConfigContext', () => {
  return {
    default: () => ({
      meetingRoomSettings: {
        layoutMode: 'active-speaker',
      },
    }),
  };
});

const mockFetchCredentials = fetchCredentials as Mock;

describe('SessionProvider', () => {
  let activeSpeakerTracker: ActiveSpeakerTracker;
  let mockUserContext: {
    user: {
      defaultSettings: { name: string };
      issues: {
        reconnections: number;
      };
    };
  };
  let vonageVideoClient: VonageVideoClient;
  let getByTestId: (id: string) => HTMLElement;

  const TestComponent = () => {
    const {
      activeSpeakerId,
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
        joinRoom('TestComponentRoom');
      }
    }, [joinRoom]);

    return (
      <div>
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
              forceMute({} as unknown as Stream);
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

  beforeEach(async () => {
    activeSpeakerTracker = Object.assign(new EventEmitter(), {
      onSubscriberDestroyed: vi.fn(),
      onSubscriberAudioLevelUpdated: vi.fn(),
    }) as unknown as ActiveSpeakerTracker;
    mockUserContext = {
      user: {
        defaultSettings: { name: 'TestUser' },
        issues: {
          reconnections: 0,
        },
      },
    };
    vonageVideoClient = Object.assign(new EventEmitter(), {
      unpublish: vi.fn(),
      connect: vi.fn().mockReturnValue(Promise.resolve()),
      disconnect: vi.fn(),
      forceMuteStream: vi.fn(),
    }) as unknown as VonageVideoClient;
    (useUserContext as Mock).mockReturnValue(mockUserContext);
    const mockedActiveSpeakerTracker = vi.mocked(ActiveSpeakerTracker);
    mockedActiveSpeakerTracker.mockImplementation(() => {
      return activeSpeakerTracker;
    });
    const mockedVonageVideoClient = vi.mocked(VonageVideoClient);
    mockedVonageVideoClient.mockImplementation(() => {
      return vonageVideoClient;
    });
    mockFetchCredentials.mockResolvedValue({
      apiKey: 'apiKey',
      sessionId: 'sessionId',
      token: 'token',
    } as Credential);

    await act(async () => {
      const result = render(
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      );
      getByTestId = result.getByTestId;
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('should update activeSpeaker state when activeSpeakerTracker emits event', async () => {
    act(() =>
      activeSpeakerTracker.emit('activeSpeakerChanged', {
        previousActiveSpeaker: { subscriberId: undefined, movingAvg: 0 },
        newActiveSpeaker: { subscriberId: 'sub1', movingAvg: 0.3 },
      })
    );
    await waitFor(() => expect(getByTestId('activeSpeaker')).toHaveTextContent('sub1'));
    act(() =>
      activeSpeakerTracker.emit('activeSpeakerChanged', {
        previousActiveSpeaker: { subscriberId: 'sub1', movingAvg: 0 },
        newActiveSpeaker: { subscriberId: 'sub2', movingAvg: 0.4 },
      })
    );
    await waitFor(() => expect(getByTestId('activeSpeaker')).toHaveTextContent('sub2'));
  });

  describe('unpublish', () => {
    it('should call unpublish on VonageVideoClient', () => {
      act(() => {
        getByTestId('unpublish').click();
      });

      expect(vonageVideoClient.unpublish).toHaveBeenCalledTimes(1);
    });

    it('should not call unpublish on VonageVideoClient if not connected', () => {
      act(() => {
        getByTestId('disconnect').click();
        getByTestId('unpublish').click();
      });

      expect(vonageVideoClient.unpublish).toHaveBeenCalledTimes(0);
    });
  });

  describe('subscriberWrappers', () => {
    it('adding a new subscriber should add it to the subscriberWrappers', () => {
      act(() => {
        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub1',
        } as unknown as SubscriberWrapper);
      });

      expect(getByTestId('subscriberWrappers')).toHaveTextContent('sub1');
      act(() => {
        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub2',
        } as unknown as SubscriberWrapper);
      });
      expect(getByTestId('subscriberWrappers')).toHaveTextContent('sub2');
      expect(getByTestId('subscriberWrappers').children.length).toBe(2);
    });

    it('removing a subscriber should remove it from the subscriberWrappers', () => {
      act(() => {
        vonageVideoClient.emit('subscriberVideoElementCreated', {
          id: 'sub1',
        } as unknown as SubscriberWrapper);
      });

      expect(getByTestId('subscriberWrappers')).toHaveTextContent('sub1');
      act(() => {
        vonageVideoClient.emit('subscriberDestroyed', 'sub1');
      });
      expect(getByTestId('subscriberWrappers')).not.toHaveTextContent('sub1');
    });
  });

  describe('session', () => {
    it('connect should call connect on VonageVideoClient and set connected to true', async () => {
      await waitFor(() => expect(getByTestId('connected')).toHaveTextContent('true'));
      expect(vonageVideoClient.connect).toHaveBeenCalledTimes(1);
    });

    it('disconnect should call disconnect on VonageVideoClient and set connected to false', async () => {
      act(() => {
        getByTestId('disconnect').click();
      });

      await waitFor(() => expect(getByTestId('connected')).toHaveTextContent('false'));
      expect(vonageVideoClient.disconnect).toHaveBeenCalledTimes(1);
    });

    it('when reconnecting session, sets reconnecting to true', async () => {
      act(() => {
        vonageVideoClient.emit('sessionReconnecting');
      });

      await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('true'));
    });

    it('when reconnected, sets reconnecting to false', async () => {
      act(() => {
        vonageVideoClient.emit('sessionReconnected');
      });

      await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('false'));
    });

    it('when re-connected, sets reconnecting to false', async () => {
      act(() => {
        vonageVideoClient.emit('sessionReconnected');
      });

      await waitFor(() => expect(getByTestId('reconnecting')).toHaveTextContent('false'));
    });

    it('when disconnected, sets connected to false', async () => {
      act(() => {
        vonageVideoClient.emit('sessionDisconnected');
      });

      await waitFor(() => expect(getByTestId('connected')).toHaveTextContent('false'));
    });

    it('when a stream property changes, it should update the state', async () => {
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
      act(() => {
        vonageVideoClient.emit('archiveStarted', 'abc123');
      });

      await waitFor(() => expect(getByTestId('archiveId')).toHaveTextContent('abc123'));
    });

    it('should set archiveId to null when archiving stops', async () => {
      act(() => {
        vonageVideoClient.emit('archiveStopped');
      });

      await waitFor(() => expect(getByTestId('archiveId')).toHaveTextContent('null'));
    });
  });

  describe('pinning', () => {
    it('should move a pinned subscriber to the top of the list', async () => {
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
    act(() => {
      getByTestId('forceMute').click();
    });

    await waitFor(() => expect(vonageVideoClient.forceMuteStream).toHaveBeenCalledTimes(1));
  });

  it('joinRoom should call fetchCredentials and connect', () => {
    expect(mockFetchCredentials).toHaveBeenCalledTimes(1);
    expect(vonageVideoClient.connect).toHaveBeenCalledTimes(1);
  });
});
