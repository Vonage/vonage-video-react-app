import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { Connection } from '@vonage/client-sdk-video';
import { ReactNode } from 'react';
import useRaiseHand from '../useRaiseHand';
import { raiseHand$, useRaisedHands, useRaisedHandCount } from '@core/stores';
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
      // Store invariant: presence in handsMap == hand is raised.
      const localHandIsRaised = !!localConnId && handsMap.has(localConnId);
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
  // raiseHand — signal payload + optimistic state
  // ---------------------------------------------------------------------------

  it('raiseHand emits the signal payload and updates localHandIsRaised optimistically', () => {
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
    expect(result.current.localHandIsRaised).toBe(true);
  });

  // ---------------------------------------------------------------------------
  // lowerHand — own hand: payload + optimistic state
  // ---------------------------------------------------------------------------

  it('lowerHand (own) emits the signal payload and clears localHandIsRaised', () => {
    const { result } = renderRaiseHand();

    act(() => result.current.raiseHand());
    mockSignal.mockClear();

    act(() => result.current.lowerHand());

    expect(mockSignal).toBeCalledTimes(1);
    const data = JSON.parse(mockSignal.mock.calls[0][0].data as string) as Record<string, unknown>;
    expect(data.raisedHand).toBe(false);
    expect(data.timestamp).toBeNull();
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

  it('onConnectionCreated unicasts the local hand state with the original timestamp', () => {
    vi.setSystemTime(50_000);
    const { result } = renderRaiseHand();
    act(() => result.current.raiseHand());

    // Time passes; new connection joins later.
    vi.setSystemTime(60_000);
    mockSignal.mockClear();

    const newConnection = { connectionId: 'new-conn', creationTime: 1, data: '' } as Connection;
    act(() => result.current.onConnectionCreated(newConnection));

    expect(mockSignal).toBeCalledTimes(1);
    const call = mockSignal.mock.calls[0][0];
    // Targets the new connection (unicast, not broadcast).
    expect(call.to).toEqual(newConnection);
    const data = JSON.parse(call.data as string) as Record<string, unknown>;
    expect(data.raisedHand).toBe(true);
    // Must be the original raise time so the late-joiner slots us at the
    // right queue position, not the moment they joined.
    expect(data.timestamp).toBe(50_000);
  });

  it('onConnectionCreated does nothing if local hand is not raised', () => {
    const { result } = renderRaiseHand();
    const newConnection = { connectionId: 'new-conn', creationTime: 1, data: '' } as Connection;
    act(() => result.current.onConnectionCreated(newConnection));
    expect(mockSignal).not.toBeCalled();
  });

  // ---------------------------------------------------------------------------
  // resetAllHands behavior on reconnect
  // ---------------------------------------------------------------------------

  it('resetAllHands preserves the local hand and re-broadcasts the original timestamp', async () => {
    vi.setSystemTime(7_000);
    const wrapper = makeSubscriberWrapper(REMOTE_CONNECTION_ID, 'Bob');
    const { result } = renderRaiseHand();

    // Local raises then someone remote raises too.
    act(() => result.current.raiseHand());
    act(() => {
      result.current.onRaiseHandSignal(
        makeRemoteSignalEvent({ raisedHand: true, timestamp: 8_000 }),
        [wrapper]
      );
    });
    await waitFor(() => expect(result.current.raisedHandCount).toBe(2));
    mockSignal.mockClear();

    act(() => result.current.resetAllHands());

    // The remote hand drops (will re-sync on reconnect via connectionCreated);
    // the local hand stays.
    await waitFor(() => expect(result.current.raisedHandCount).toBe(1));
    expect(result.current.localHandIsRaised).toBe(true);

    // And we re-broadcast our raise with the *original* timestamp so other
    // peers slot us back into the right queue position.
    expect(mockSignal).toBeCalledTimes(1);
    const data = JSON.parse(mockSignal.mock.calls[0][0].data as string) as Record<string, unknown>;
    expect(data.raisedHand).toBe(true);
    expect(data.timestamp).toBe(7_000);
  });

  it('resetAllHands clears everything and sends nothing when the local hand was not raised', async () => {
    const wrapper = makeSubscriberWrapper(REMOTE_CONNECTION_ID, 'Bob');
    const { result } = renderRaiseHand();
    act(() => {
      result.current.onRaiseHandSignal(makeRemoteSignalEvent({ raisedHand: true, timestamp: 1 }), [
        wrapper,
      ]);
    });
    await waitFor(() => expect(result.current.raisedHandCount).toBe(1));
    mockSignal.mockClear();

    act(() => result.current.resetAllHands());

    await waitFor(() => expect(result.current.raisedHandCount).toBe(0));
    expect(mockSignal).not.toBeCalled();
  });

  // ---------------------------------------------------------------------------
  // Robustness — malformed payloads / missing dependencies
  // ---------------------------------------------------------------------------

  it('onRaiseHandSignal swallows malformed JSON instead of crashing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderRaiseHand();
    const wrapper = makeSubscriberWrapper(REMOTE_CONNECTION_ID, 'Bob');

    const event = {
      type: 'signal:raiseHand',
      data: '{not json',
      from: { connectionId: REMOTE_CONNECTION_ID, creationTime: 1, data: '' } as Connection,
    } as SignalEvent;

    expect(() => act(() => result.current.onRaiseHandSignal(event, [wrapper]))).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
    expect(result.current.raisedHandCount).toBe(0);
    warnSpy.mockRestore();
  });

  it('raise / lower / lowerAll are no-ops when the signal function is unavailable', () => {
    const { result } = renderHook(() => useRaiseHand({ ...defaultProps, signal: undefined }), {
      wrapper,
    });

    act(() => result.current.raiseHand());
    act(() => result.current.lowerHand());
    act(() => result.current.lowerHand(REMOTE_CONNECTION_ID));
    act(() => result.current.lowerAllHands());

    // Nothing was sent, and the store stays empty.
    expect(mockSignal).not.toBeCalled();
  });

  it('lowerAllHands sends one signal per raised hand (not per entry in the map)', async () => {
    const wrapperA = makeSubscriberWrapper('conn-a', 'A');
    const wrapperB = makeSubscriberWrapper('conn-b', 'B');
    const wrapperC = makeSubscriberWrapper('conn-c', 'C');
    const { result } = renderRaiseHand();

    act(() => {
      // Three raises…
      result.current.onRaiseHandSignal(
        {
          type: 'signal:raiseHand',
          data: JSON.stringify({ raisedHand: true, timestamp: 1 }),
          from: { connectionId: 'conn-a', creationTime: 1, data: '' } as Connection,
        },
        [wrapperA, wrapperB, wrapperC]
      );
      result.current.onRaiseHandSignal(
        {
          type: 'signal:raiseHand',
          data: JSON.stringify({ raisedHand: true, timestamp: 2 }),
          from: { connectionId: 'conn-b', creationTime: 1, data: '' } as Connection,
        },
        [wrapperA, wrapperB, wrapperC]
      );
      result.current.onRaiseHandSignal(
        {
          type: 'signal:raiseHand',
          data: JSON.stringify({ raisedHand: true, timestamp: 3 }),
          from: { connectionId: 'conn-c', creationTime: 1, data: '' } as Connection,
        },
        [wrapperA, wrapperB, wrapperC]
      );
    });

    await waitFor(() => expect(result.current.raisedHandCount).toBe(3));
    mockSignal.mockClear();

    act(() => result.current.lowerAllHands());

    expect(mockSignal).toBeCalledTimes(3);
    const targets = mockSignal.mock.calls.map((c) => {
      const data = JSON.parse(c[0].data as string) as { connectionId: string };
      return data.connectionId;
    });
    expect(new Set(targets)).toEqual(new Set(['conn-a', 'conn-b', 'conn-c']));
  });
});
