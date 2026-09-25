import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Connection } from '@vonage/client-sdk-video';
import { raiseHand$ } from '@core/stores';
import type { SignalEvent } from '@app-types/session';
import useRaiseHand from './useRaiseHand';

const localConnectionId = 'local-connection';
const remoteConnection = { connectionId: 'remote-connection' } as Connection;

const makeSignalEvent = (from: Connection | null, data: string): SignalEvent =>
  ({ type: 'signal:raiseHand', data, from }) as unknown as SignalEvent;

describe('useRaiseHand', () => {
  const signal = vi.fn();

  beforeEach(() => {
    signal.mockReset();
    raiseHand$.actions.lowerAllHands();
  });

  const renderRaiseHand = (options: { signal?: typeof signal } = { signal }) =>
    renderHook(() =>
      useRaiseHand({ signal: options.signal, getConnectionId: () => localConnectionId })
    );

  it('raiseHand updates the local store and broadcasts a raise signal', () => {
    const { result } = renderRaiseHand();

    act(() => result.current.raiseHand());

    expect(raiseHand$.getState().raisedHands[localConnectionId]).toBeDefined();
    expect(signal).toHaveBeenCalledWith({
      type: 'raiseHand',
      data: expect.stringContaining('"raisedHand":true'),
    });
  });

  it('lowerHand clears the local store and broadcasts a lower signal', () => {
    const { result } = renderRaiseHand();

    act(() => result.current.raiseHand());
    act(() => result.current.lowerHand());

    expect(raiseHand$.getState().raisedHands[localConnectionId]).toBeUndefined();
    expect(signal).toHaveBeenLastCalledWith({
      type: 'raiseHand',
      data: expect.stringContaining('"raisedHand":false'),
    });
  });

  it('does nothing before the session can signal', () => {
    const { result } = renderRaiseHand({ signal: undefined });

    act(() => result.current.raiseHand());

    expect(raiseHand$.getState().raisedHands).toEqual({});
  });

  it('callbacks obtained before connecting use the signal provided after connecting', () => {
    const { result, rerender } = renderHook(
      ({ signal: currentSignal }: { signal?: typeof signal }) =>
        useRaiseHand({ signal: currentSignal, getConnectionId: () => localConnectionId }),
      { initialProps: {} }
    );
    const { onConnectionCreated } = result.current;
    raiseHand$.actions.raiseHand({ connectionId: localConnectionId, raisedAt: 7 });

    rerender({ signal });
    act(() => onConnectionCreated(remoteConnection));

    expect(signal).toHaveBeenCalledWith(expect.objectContaining({ to: remoteConnection }));
  });

  it('applies remote raise and lower signals using the sender timestamp', () => {
    const { result } = renderRaiseHand();

    act(() =>
      result.current.onRaiseHandSignal(
        makeSignalEvent(remoteConnection, JSON.stringify({ raisedHand: true, timestamp: 42 }))
      )
    );

    expect(raiseHand$.getState().raisedHands[remoteConnection.connectionId]).toEqual({
      connectionId: remoteConnection.connectionId,
      raisedAt: 42,
    });

    act(() =>
      result.current.onRaiseHandSignal(
        makeSignalEvent(remoteConnection, JSON.stringify({ raisedHand: false, timestamp: 43 }))
      )
    );

    expect(raiseHand$.getState().raisedHands[remoteConnection.connectionId]).toBeUndefined();
  });

  it('ignores the echo of its own raise signal and malformed payloads', () => {
    const { result } = renderRaiseHand();
    const ownConnection = { connectionId: localConnectionId } as Connection;

    act(() => {
      result.current.onRaiseHandSignal(
        makeSignalEvent(ownConnection, JSON.stringify({ raisedHand: true, timestamp: 1 }))
      );
      result.current.onRaiseHandSignal(makeSignalEvent(remoteConnection, 'not json'));
      result.current.onRaiseHandSignal(
        makeSignalEvent(remoteConnection, JSON.stringify({ raisedHand: true }))
      );
      result.current.onRaiseHandSignal(
        makeSignalEvent(null, JSON.stringify({ raisedHand: true, timestamp: 1 }))
      );
    });

    expect(raiseHand$.getState().raisedHands).toEqual({});
  });

  it('sends the local raised hand with its original timestamp to a new connection', () => {
    const { result } = renderRaiseHand();
    raiseHand$.actions.raiseHand({ connectionId: localConnectionId, raisedAt: 7 });

    act(() => result.current.onConnectionCreated(remoteConnection));

    expect(signal).toHaveBeenCalledWith({
      type: 'raiseHand',
      data: JSON.stringify({ raisedHand: true, timestamp: 7 }),
      to: remoteConnection,
    });
  });

  it('sends nothing to a new connection when the local hand is down', () => {
    const { result } = renderRaiseHand();

    act(() => result.current.onConnectionCreated(remoteConnection));

    expect(signal).not.toHaveBeenCalled();
  });

  it('lowers the hand of a participant whose connection was destroyed', () => {
    const { result } = renderRaiseHand();
    raiseHand$.actions.raiseHand({ connectionId: remoteConnection.connectionId });

    act(() => result.current.onConnectionDestroyed(remoteConnection.connectionId));

    expect(raiseHand$.getState().raisedHands).toEqual({});
  });
});
