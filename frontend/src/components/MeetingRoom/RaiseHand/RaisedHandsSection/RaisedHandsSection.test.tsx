import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import useSessionContext from '@hooks/useSessionContext';
import { SessionContextType } from '@Context/SessionProvider/session';
import { RaiseHandState } from '@app-types/session';
import { useRaisedHands, useRaisedHandCount } from '../../../../stores/raiseHand';
import RaisedHandsSection from './RaisedHandsSection';

vi.mock('@hooks/useSessionContext');
vi.mock('../../../../stores/raiseHand', () => ({
  useRaisedHands: vi.fn(),
  useRaisedHandCount: vi.fn(),
}));

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const mockUseRaisedHands = useRaisedHands as Mock<[], RaiseHandState[]>;
const mockUseRaisedHandCount = useRaisedHandCount as Mock<[], number>;

const twoHands: RaiseHandState[] = [
  { connectionId: 'conn-a', participantName: 'Alice', raisedHand: true, raisedHandTimestamp: 1000 },
  { connectionId: 'conn-b', participantName: 'Bob', raisedHand: true, raisedHandTimestamp: 2000 },
];

describe('RaisedHandsSection', () => {
  const mockLowerHand = vi.fn();
  const mockLowerAllHands = vi.fn();

  const setHands = (hands: RaiseHandState[]) => {
    mockUseRaisedHands.mockReturnValue(hands);
    mockUseRaisedHandCount.mockReturnValue(hands.length);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSessionContext.mockReturnValue({
      lowerHand: mockLowerHand,
      lowerAllHands: mockLowerAllHands,
    } as unknown as SessionContextType);
    setHands([]);
  });

  // Visibility when raisedHandCount === 0 is gated by the parent
  // (ParticipantList: `{raisedHandCount > 0 && <RaisedHandsSection />}`).
  // The component itself always renders when mounted.

  it('renders the section when raisedHandCount > 0', () => {
    setHands(twoHands);
    render(<RaisedHandsSection />);
    expect(screen.getByTestId('raised-hands-section')).toBeInTheDocument();
  });

  it('displays all participants with raised hands', () => {
    setHands(twoHands);
    render(<RaisedHandsSection />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows "Lower all" button', () => {
    setHands(twoHands);
    render(<RaisedHandsSection />);
    expect(screen.getByTestId('lower-all-button')).toBeInTheDocument();
  });

  it('opens confirmation dialog when "Lower all" is clicked', async () => {
    setHands(twoHands);
    render(<RaisedHandsSection />);
    fireEvent.click(screen.getByTestId('lower-all-button'));
    await waitFor(() => {
      expect(screen.getByTestId('lower-all-dialog')).toBeInTheDocument();
    });
  });

  it('calls lowerAllHands and closes dialog on confirm', async () => {
    setHands(twoHands);
    render(<RaisedHandsSection />);
    fireEvent.click(screen.getByTestId('lower-all-button'));
    await waitFor(() => expect(screen.getByTestId('lower-all-dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('lower-all-confirm-button'));
    expect(mockLowerAllHands).toHaveBeenCalledOnce();

    await waitFor(() => {
      expect(screen.queryByTestId('lower-all-dialog')).not.toBeInTheDocument();
    });
  });

  it('does NOT call lowerAllHands when dialog is cancelled', async () => {
    setHands(twoHands);
    render(<RaisedHandsSection />);
    fireEvent.click(screen.getByTestId('lower-all-button'));
    await waitFor(() => expect(screen.getByTestId('lower-all-dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('lower-all-cancel-button'));
    expect(mockLowerAllHands).not.toHaveBeenCalled();
  });

  it('lower individual hand button calls lowerHand with the correct connectionId', () => {
    setHands(twoHands);
    render(<RaisedHandsSection />);
    fireEvent.click(screen.getByTestId('lower-hand-conn-a'));
    expect(mockLowerHand).toHaveBeenCalledWith('conn-a');
  });

  it('renders an empty queue without crashing (parent gates visibility, but be defensive)', () => {
    setHands([]);
    render(<RaisedHandsSection />);
    expect(screen.getByTestId('raised-hands-section')).toBeInTheDocument();
    expect(screen.queryByTestId(/^raised-hand-item-/)).not.toBeInTheDocument();
  });

  it('exposes the correct count badge for the visible queue', () => {
    setHands(twoHands);
    render(<RaisedHandsSection />);
    expect(screen.getByTestId('raised-hands-count-badge')).toHaveTextContent('2');
  });

  it('preserves the queue order received from the store (does not re-sort)', () => {
    // Bob first, Alice second — RaisedHandsSection should render in this order
    // because sorting happens in the useRaisedHands selector, not the view.
    setHands([twoHands[1], twoHands[0]]);
    render(<RaisedHandsSection />);
    const items = screen.getAllByTestId(/^raised-hand-item-/);
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveAttribute('data-testid', 'raised-hand-item-conn-b');
    expect(items[1]).toHaveAttribute('data-testid', 'raised-hand-item-conn-a');
  });

  it('renders an aria-label on each lower button so screen readers know whose hand is targeted', () => {
    setHands(twoHands);
    render(<RaisedHandsSection />);
    expect(screen.getByLabelText("Lower Alice's hand")).toBeInTheDocument();
    expect(screen.getByLabelText("Lower Bob's hand")).toBeInTheDocument();
  });

  it('does NOT call lowerAllHands when the dialog is dismissed via Escape', async () => {
    setHands(twoHands);
    render(<RaisedHandsSection />);
    fireEvent.click(screen.getByTestId('lower-all-button'));
    await waitFor(() => expect(screen.getByTestId('lower-all-dialog')).toBeInTheDocument());

    fireEvent.keyDown(screen.getByTestId('lower-all-dialog'), { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByTestId('lower-all-dialog')).not.toBeInTheDocument();
    });
    expect(mockLowerAllHands).not.toHaveBeenCalled();
  });
});
