import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Connection } from '@vonage/client-sdk-video';
import { ReactNode } from 'react';
import useRaiseHand from '../useRaiseHand';
import raiseHand$, { useRaisedHands, useRaisedHandCount } from '../../stores/raiseHand';
import { SignalEvent, SubscriberWrapper } from '../../types/session';

const mockSignal = vi.fn();
const mockGetConnectionId = vi.fn();

const LOCAL_CONNECTION_ID = 'local-123';
const REMOTE_CONNECTION_ID = 'remote-456';

const makeRemoteSignalEvent = (
  payload: object,
  connectionId = REMOTE_CONNECTION_ID
): SignalEvent => ({
  type: 'signal:raiseHand',
  data: JSON.stringify(payload),
  from: { connectionId, creationTime: 1, data: '' } as Connection,
});

const makeSubscriberWrapper = (connectionId: string, name: string): SubscriberWrapper =>
  ({
    subscriber: {
      stream: {
        connection: { connectionId },
        name,
        hasAudio: true,
        hasVideo: true,
      },
    },
    isScreenshare: false,
    id: connectionId,
    isPinned: false,
  }) as unknown as SubscriberWrapper;

const defaultProps = {
  signal: mockSignal,
  getConnectionId: mockGetConnectionId,
  localUserName: 'Alice',
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <raiseHand$.Provider>{children}</raiseHand$.Provider>
);

/**
 * Combined render that returns the hook's actions/handlers PLUS the store
 * state slices that the old single-hook API used to expose. Lets the existing
 * assertions keep working after the architectural split.
 */
const renderRaiseHand = () =>
  renderHook(
    () => {
      const hook = useRaiseHand(defaultProps);
      const raisedHands = useRaisedHands();
      const raisedHandCount = useRaisedHandCount();
      const [{ handsMap }] = raiseHand$.use();
      const localConnId = mockGetConnectionId() as string | undefined;
      const localHandIsRaised = !!localConnId && handsMap.get(localConnId)?.raisedHand === true;
      return { ...hook, raisedHands, raisedHandCount, localHandIsRaised };
    },
    { wrapper }
  );

describe('useRaiseHand', () => {
  beforeEach(() => {
    // shouldAdvanceTime keeps testing-library's waitFor / async helpers
    // working with fake timers (otherwise polling never sees state updates).
    vi.useFakeTimers({ shouldAdvanceTime: true });
    mockGetConnectionId.mockReturnValue(LOCAL_CONNECTION_ID);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Initial state
  // ---------------------------------------------------------------------------

  it('starts with no raised hands', () => {
    const { result } = renderRaiseHand();
    expect(result.current.raisedHands).toEqual([]);
    expect(result.current.raisedHandCount).toBe(0);
    expect(result.current.localHandIsRaised).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // raiseHand — signal payload
  // ---------------------------------------------------------------------------

  it('raiseHand sends the correct signal payload', () => {
    vi.setSystemTime(12_000_000);
    const { result } = renderRaiseHand();

    act(() => {
      result.current.raiseHand();
    });

    expect(mockSignal).toBeCalledTimes(1);
    const call = mockSignal.mock.calls[0][0] as { type: string; data: string };
    expect(call.type).toBe('raiseHand');
    const data = JSON.parse(call.data) as Record<string, unknown>;
    expect(data.raisedHand).toBe(true);
    expect(data.timestamp).toBe(12_000_000);
  });

  it('raiseHand updates localHandIsRaised optimistically', () => {
    const { result } = renderRaiseHand();

    act(() => {
      result.current.raiseHand();
    });

    expect(result.current.localHandIsRaised).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // lowerHand — own hand
  // ---------------------------------------------------------------------------

  it('lowerHand (own) sends the correct signal payload', () => {
    const { result } = renderRaiseHand();

    act(() => result.current.raiseHand());
    mockSignal.mockClear();

    act(() => result.current.lowerHand());

    expect(mockSignal).toBeCalledTimes(1);
    const data = JSON.parse(mockSignal.mock.calls[0][0].data as string) as Record<string, unknown>;
    expect(data.raisedHand).toBe(false);
    expect(data.timestamp).toBeNull();
  });

  it('lowerHand (own) clears localHandIsRaised', () => {
    const { result } = renderRaiseHand();
    act(() => result.current.raiseHand());
    act(() => result.current.lowerHand());
    expect(result.current.localHandIsRaised).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // lowerHand — remote (moderator action)
  // ---------------------------------------------------------------------------

  it('lowerHand(connectionId) sends a signal including loweredBy', () => {
    const { result } = renderRaiseHand();

    act(() => result.current.lowerHand(REMOTE_CONNECTION_ID));

    const data = JSON.parse(mockSignal.mock.calls[0][0].data as string) as Record<string, unknown>;
    expect(data.raisedHand).toBe(false);
    expect(data.loweredBy).toBe(LOCAL_CONNECTION_ID);
    expect(data.connectionId).toBe(REMOTE_CONNECTION_ID);
  });

  // ---------------------------------------------------------------------------
  // onRaiseHandSignal — inbound
  // ---------------------------------------------------------------------------

  it('onRaiseHandSignal adds a remote participant to raisedHands', async () => {
    const wrapper = makeSubscriberWrapper(REMOTE_CONNECTION_ID, 'Bob');
    const { result } = renderRaiseHand();

    const event = makeRemoteSignalEvent({ raisedHand: true, timestamp: 5000 });

    act(() => {
      result.current.onRaiseHandSignal(event, [wrapper]);
    });

    await waitFor(() => {
      expect(result.current.raisedHands).toHaveLength(1);
      expect(result.current.raisedHands[0].participantName).toBe('Bob');
      expect(result.current.raisedHands[0].connectionId).toBe(REMOTE_CONNECTION_ID);
    });
  });

  it('onRaiseHandSignal removes a participant when raisedHand: false', async () => {
    const wrapper = makeSubscriberWrapper(REMOTE_CONNECTION_ID, 'Bob');
    const { result } = renderRaiseHand();

    // First raise
    act(() => {
      result.current.onRaiseHandSignal(
        makeRemoteSignalEvent({ raisedHand: true, timestamp: 5000 }),
        [wrapper]
      );
    });

    // Then lower
    act(() => {
      result.current.onRaiseHandSignal(
        makeRemoteSignalEvent({
          raisedHand: false,
          timestamp: null,
          connectionId: REMOTE_CONNECTION_ID,
        }),
        [wrapper]
      );
    });

    await waitFor(() => {
      expect(result.current.raisedHands).toHaveLength(0);
    });
  });

  // ---------------------------------------------------------------------------
  // Queue ordering
  // ---------------------------------------------------------------------------

  it('raisedHands is sorted by timestamp ascending (queue order)', async () => {
    const wrapperA = makeSubscriberWrapper('conn-a', 'Alice-remote');
    const wrapperB = makeSubscriberWrapper('conn-b', 'Bob-remote');
    const { result } = renderRaiseHand();

    act(() => {
      // Bob raised first (lower timestamp)
      result.current.onRaiseHandSignal(
        {
          ...makeRemoteSignalEvent({ raisedHand: true, timestamp: 1000 }, 'conn-b'),
          from: { connectionId: 'conn-b', creationTime: 1, data: '' } as Connection,
        },
        [wrapperA, wrapperB]
      );
      result.current.onRaiseHandSignal(
        {
          ...makeRemoteSignalEvent({ raisedHand: true, timestamp: 2000 }, 'conn-a'),
          from: { connectionId: 'conn-a', creationTime: 1, data: '' } as Connection,
        },
        [wrapperA, wrapperB]
      );
    });

    await waitFor(() => {
      expect(result.current.raisedHands[0].participantName).toBe('Bob-remote');
      expect(result.current.raisedHands[1].participantName).toBe('Alice-remote');
    });
  });

  // ---------------------------------------------------------------------------
  // lowerAllHands
  // ---------------------------------------------------------------------------

  it('lowerAllHands clears all raised hands and sends signals for each', async () => {
    const wrapperA = makeSubscriberWrapper('conn-a', 'A');
    const wrapperB = makeSubscriberWrapper('conn-b', 'B');
    const { result } = renderRaiseHand();

    act(() => {
      result.current.onRaiseHandSignal(
        {
          type: 'signal:raiseHand',
          data: JSON.stringify({ raisedHand: true, timestamp: 1 }),
          from: { connectionId: 'conn-a', creationTime: 1, data: '' } as Connection,
        },
        [wrapperA, wrapperB]
      );
      result.current.onRaiseHandSignal(
        {
          type: 'signal:raiseHand',
          data: JSON.stringify({ raisedHand: true, timestamp: 2 }),
          from: { connectionId: 'conn-b', creationTime: 1, data: '' } as Connection,
        },
        [wrapperA, wrapperB]
      );
    });

    await waitFor(() => expect(result.current.raisedHandCount).toBe(2));

    mockSignal.mockClear();

    act(() => result.current.lowerAllHands());

    await waitFor(() => expect(result.current.raisedHandCount).toBe(0));
    expect(mockSignal).toBeCalledTimes(2);
  });

  // ---------------------------------------------------------------------------
  // onConnectionDestroyed
  // ---------------------------------------------------------------------------

  it('onConnectionDestroyed removes the departed participant from the queue', async () => {
    const wrapper = makeSubscriberWrapper(REMOTE_CONNECTION_ID, 'Bob');
    const { result } = renderRaiseHand();

    act(() => {
      result.current.onRaiseHandSignal(
        makeRemoteSignalEvent({ raisedHand: true, timestamp: 1000 }),
        [wrapper]
      );
    });

    await waitFor(() => expect(result.current.raisedHandCount).toBe(1));

    act(() => result.current.onConnectionDestroyed(REMOTE_CONNECTION_ID));

    await waitFor(() => expect(result.current.raisedHandCount).toBe(0));
  });

  // ---------------------------------------------------------------------------
  // resetAllHands
  // ---------------------------------------------------------------------------

  it('resetAllHands clears all raised hands immediately', async () => {
    const wrapper = makeSubscriberWrapper(REMOTE_CONNECTION_ID, 'Bob');
    const { result } = renderRaiseHand();

    act(() => {
      result.current.onRaiseHandSignal(makeRemoteSignalEvent({ raisedHand: true, timestamp: 1 }), [
        wrapper,
      ]);
    });

    await waitFor(() => expect(result.current.raisedHandCount).toBe(1));

    act(() => result.current.resetAllHands());

    await waitFor(() => expect(result.current.raisedHandCount).toBe(0));
  });

  it('onConnectionCreated unicasts the local hand state to a new connection', () => {
    vi.setSystemTime(99_000);
    const { result } = renderRaiseHand();

    act(() => result.current.raiseHand());
    mockSignal.mockClear();

    const newConnection = { connectionId: 'new-conn', creationTime: 1, data: '' } as Connection;
    act(() => result.current.onConnectionCreated(newConnection));

    expect(mockSignal).toBeCalledTimes(1);
    const call = mockSignal.mock.calls[0][0];
    expect(call.to).toEqual(newConnection);
    const data = JSON.parse(call.data as string) as Record<string, unknown>;
    expect(data.raisedHand).toBe(true);
  });

  it('onConnectionCreated does nothing if local hand is not raised', () => {
    const { result } = renderRaiseHand();
    const newConnection = { connectionId: 'new-conn', creationTime: 1, data: '' } as Connection;
    act(() => result.current.onConnectionCreated(newConnection));
    expect(mockSignal).not.toBeCalled();
  });
});
