import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import useSessionContext from '@hooks/useSessionContext';
import { SessionContextType } from '@Context/SessionProvider/session';
import { RaiseHandState } from '@app-types/session';
import RaiseHandToast from './RaiseHandToast';

vi.mock('@hooks/useSessionContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

const LOCAL_CONN_ID = 'conn-local';

const makeHand = (id: string, name: string, ts: number): RaiseHandState => ({
  connectionId: id,
  participantName: name,
  raisedHand: true,
  raisedHandTimestamp: ts,
});

describe('RaiseHandToast', () => {
  const mockToggle = vi.fn();
  const mockGetConnectionId = vi.fn().mockReturnValue(LOCAL_CONN_ID);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetConnectionId.mockReturnValue(LOCAL_CONN_ID);
    mockUseSessionContext.mockReturnValue({
      raisedHands: [],
      raisedHandCount: 0,
      toggleParticipantList: mockToggle,
      getConnectionId: mockGetConnectionId,
    } as unknown as SessionContextType);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not show a toast on mount with no hands raised', () => {
    render(<RaiseHandToast />);
    // Snackbar with open=false should not be visible
    const toast = screen.queryByTestId('raise-hand-toast');
    if (toast) {
      expect(toast).not.toBeVisible();
    } else {
      expect(toast).not.toBeInTheDocument();
    }
  });

  it('shows a toast when a remote participant raises their hand', () => {
    vi.useFakeTimers();
    const { rerender } = render(<RaiseHandToast />);

    // Simulate remote participant raising hand
    mockUseSessionContext.mockReturnValue({
      raisedHands: [makeHand('conn-b', 'Bob', Date.now())],
      raisedHandCount: 1,
      toggleParticipantList: mockToggle,
      getConnectionId: mockGetConnectionId,
    } as unknown as SessionContextType);

    rerender(<RaiseHandToast />);

    // Advance past the 2s coalesce window — act flushes the state update
    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.getByTestId('raise-hand-toast')).toBeVisible();
  });

  it('shows "View queue" button in the toast after a raise', () => {
    vi.useFakeTimers();
    const { rerender } = render(<RaiseHandToast />);

    mockUseSessionContext.mockReturnValue({
      raisedHands: [makeHand('conn-b', 'Bob', Date.now())],
      raisedHandCount: 1,
      toggleParticipantList: mockToggle,
      getConnectionId: mockGetConnectionId,
    } as unknown as SessionContextType);

    rerender(<RaiseHandToast />);

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.getByTestId('raise-hand-toast-view-queue')).toBeInTheDocument();
  });
});
