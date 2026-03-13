import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import useSessionContext from '@hooks/useSessionContext';
import useUserContext from '@hooks/useUserContext';
import { SessionContextType } from '@Context/SessionProvider/session';
import { UserContextType } from '@Context/user';
import { RaiseHandState } from '@app-types/session';
import RaiseHandToast from './RaiseHandToast';

vi.mock('@hooks/useSessionContext');
vi.mock('@hooks/useUserContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const mockUseUserContext = useUserContext as Mock<[], UserContextType>;

const makeHand = (id: string, name: string, ts: number): RaiseHandState => ({
  connectionId: id,
  participantName: name,
  raisedHand: true,
  raisedHandTimestamp: ts,
});

const mockUserContext = {
  user: {
    defaultSettings: {
      name: 'Local User',
      publishAudio: true,
      publishVideo: true,
      noiseSuppression: false,
      publishCaptions: false,
    },
    issues: { reconnections: 0, audioFallbacks: 0 },
  },
  setUser: vi.fn(),
} as unknown as UserContextType;

describe('RaiseHandToast', () => {
  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseUserContext.mockReturnValue(mockUserContext);
    mockUseSessionContext.mockReturnValue({
      raisedHands: [],
      raisedHandCount: 0,
      toggleParticipantList: mockToggle,
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

  it('shows a toast when a remote participant raises their hand', async () => {
    vi.useFakeTimers();
    const { rerender } = render(<RaiseHandToast />);

    // Simulate remote participant raising hand
    mockUseSessionContext.mockReturnValue({
      raisedHands: [makeHand('conn-b', 'Bob', Date.now())],
      raisedHandCount: 1,
      toggleParticipantList: mockToggle,
    } as unknown as SessionContextType);

    rerender(<RaiseHandToast />);

    // Advance past the 2s coalesce window — act flushes the state update
    await act(async () => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.getByTestId('raise-hand-toast')).toBeVisible();
  });

  it('shows "View queue" button in the toast after a raise', async () => {
    vi.useFakeTimers();
    const { rerender } = render(<RaiseHandToast />);

    mockUseSessionContext.mockReturnValue({
      raisedHands: [makeHand('conn-b', 'Bob', Date.now())],
      raisedHandCount: 1,
      toggleParticipantList: mockToggle,
    } as unknown as SessionContextType);

    rerender(<RaiseHandToast />);

    await act(async () => {
      vi.advanceTimersByTime(2100);
    });

    expect(screen.getByTestId('raise-hand-toast-view-queue')).toBeInTheDocument();
  });
});
