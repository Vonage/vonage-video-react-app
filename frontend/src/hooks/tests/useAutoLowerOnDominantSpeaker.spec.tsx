import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRef, RefObject } from 'react';
import { useAutoLowerOnDominantSpeaker } from '../useAutoLowerOnDominantSpeaker';
import { RaiseHandState } from '../../types/session';

const LOCAL_CONNECTION_ID = 'local-123';
const SPEAKING_LEVEL = 50;
const QUIET_LEVEL = 0;
const AUTO_LOWER_MS = 2_000;

const mockSignal = vi.fn();
const mockSetRaisedHandsMap = vi.fn();
const mockGetConnectionId = vi.fn();

const buildMap = (handRaised: boolean): Map<string, RaiseHandState> => {
  const map = new Map<string, RaiseHandState>();
  if (handRaised) {
    map.set(LOCAL_CONNECTION_ID, {
      connectionId: LOCAL_CONNECTION_ID,
      participantName: 'Alice',
      raisedHand: true,
      raisedHandTimestamp: 1,
    });
  }
  return map;
};

/**
 * Wrapper that gives the hook a real `useRef` for the raised-hands map (so the
 * ref identity is stable across renders) while letting tests control the
 * publisherAudioLevel and whether the hand is raised.
 */
const useTestHarness = ({
  publisherAudioLevel,
  handRaised,
}: {
  publisherAudioLevel: number;
  handRaised: boolean;
}): RefObject<Map<string, RaiseHandState>> => {
  const raisedHandsMapRef = useRef<Map<string, RaiseHandState>>(buildMap(handRaised));
  raisedHandsMapRef.current = buildMap(handRaised);
  useAutoLowerOnDominantSpeaker({
    publisherAudioLevel,
    getConnectionId: mockGetConnectionId,
    raisedHandsMapRef,
    signal: mockSignal,
    setRaisedHandsMap: mockSetRaisedHandsMap,
  });
  return raisedHandsMapRef;
};

describe('useAutoLowerOnDominantSpeaker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockGetConnectionId.mockReturnValue(LOCAL_CONNECTION_ID);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it('does not start a timer or fire a signal when the local hand is not raised', () => {
    renderHook(() => useTestHarness({ publisherAudioLevel: SPEAKING_LEVEL, handRaised: false }));

    act(() => {
      vi.advanceTimersByTime(AUTO_LOWER_MS + 100);
    });

    expect(mockSignal).not.toBeCalled();
    expect(mockSetRaisedHandsMap).not.toBeCalled();
  });

  it('fires the auto-lower signal after 2s of sustained speaking with hand raised', () => {
    const { rerender } = renderHook(
      ({ publisherAudioLevel }) => useTestHarness({ publisherAudioLevel, handRaised: true }),
      { initialProps: { publisherAudioLevel: QUIET_LEVEL } }
    );

    rerender({ publisherAudioLevel: SPEAKING_LEVEL });

    act(() => {
      vi.advanceTimersByTime(AUTO_LOWER_MS + 50);
    });

    expect(mockSignal).toBeCalledTimes(1);
    const call = mockSignal.mock.calls[0][0] as { type: string; data: string };
    expect(call.type).toBe('raiseHand');
    const data = JSON.parse(call.data) as Record<string, unknown>;
    expect(data.raisedHand).toBe(false);
    expect(data.loweredBy).toBe('auto-speak');
    expect(data.connectionId).toBe(LOCAL_CONNECTION_ID);

    expect(mockSetRaisedHandsMap).toBeCalledTimes(1);
  });

  it('does NOT fire the signal if audio drops below threshold before 2s elapse', () => {
    const { rerender } = renderHook(
      ({ publisherAudioLevel }) => useTestHarness({ publisherAudioLevel, handRaised: true }),
      { initialProps: { publisherAudioLevel: QUIET_LEVEL } }
    );

    rerender({ publisherAudioLevel: SPEAKING_LEVEL });

    act(() => {
      vi.advanceTimersByTime(1_000);
    });

    rerender({ publisherAudioLevel: QUIET_LEVEL });

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(mockSignal).not.toBeCalled();
    expect(mockSetRaisedHandsMap).not.toBeCalled();
  });

  it('only fires once per sustained speaking session', () => {
    const { rerender } = renderHook(
      ({ publisherAudioLevel }) => useTestHarness({ publisherAudioLevel, handRaised: true }),
      { initialProps: { publisherAudioLevel: QUIET_LEVEL } }
    );

    rerender({ publisherAudioLevel: SPEAKING_LEVEL });

    act(() => {
      vi.advanceTimersByTime(AUTO_LOWER_MS + 50);
    });

    expect(mockSignal).toBeCalledTimes(1);

    // Continue speaking — should not re-fire
    rerender({ publisherAudioLevel: SPEAKING_LEVEL + 10 });
    act(() => {
      vi.advanceTimersByTime(AUTO_LOWER_MS + 50);
    });

    expect(mockSignal).toBeCalledTimes(1);
  });
});
