import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';
import EventEmitter from 'events';
import { Publisher } from '@vonage/client-sdk-video';
import useSessionContext from '../../hooks/useSessionContext';
import SessionProvider from './session';
import ActiveSpeakerTracker from '../../utils/ActiveSpeakerTracker';
import useUserContext from '../../hooks/useUserContext';
import VonageVideoClient from '../../utils/VonageVideoClient';
import { Credential } from '../../types/session';

vi.mock('../../utils/ActiveSpeakerTracker');
vi.mock('../../hooks/useUserContext');
vi.mock('../../utils/VonageVideoClient');

describe('SessionProvider', () => {
  let activeSpeakerTracker: ActiveSpeakerTracker;
  let mockUserContext: { user: { defaultSettings: { name: string } } };
  let vonageVideoClient: VonageVideoClient;

  const TestComponent = () => {
    const { activeSpeakerId, unpublish, connect, disconnect } = useSessionContext();
    if (connect) {
      connect({
        apiKey: 'apiKey',
        sessionId: 'sessionId',
        token: 'token',
      } as unknown as Credential);
    }
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
        <span data-testid="activeSpeaker">{activeSpeakerId}</span>
      </div>
    );
  };
  beforeEach(() => {
    activeSpeakerTracker = Object.assign(new EventEmitter(), {
      onSubscriberDestroyed: vi.fn(),
      onSubscriberAudioLevelUpdated: vi.fn(),
    }) as unknown as ActiveSpeakerTracker;
    mockUserContext = { user: { defaultSettings: { name: 'TestUser' } } };
    vonageVideoClient = Object.assign(new EventEmitter(), {
      unpublish: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
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
  });

  it('should update activeSpeaker state when activeSpeakerTracker emits event', async () => {
    const { getByTestId } = render(
      <SessionProvider>
        <TestComponent />
      </SessionProvider>
    );

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
    it('should call unpublish on VonageVideoClient', async () => {
      const { getByTestId } = render(
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      );

      act(() => {
        getByTestId('unpublish').click();
      });

      expect(vonageVideoClient.unpublish).toHaveBeenCalledTimes(1);
    });

    it('should not call unpublish on VonageVideoClient if not connected', async () => {
      const { getByTestId } = render(
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      );

      act(() => {
        getByTestId('disconnect').click();
        getByTestId('unpublish').click();
      });

      expect(vonageVideoClient.unpublish).toHaveBeenCalledTimes(0);
    });
  });
});
