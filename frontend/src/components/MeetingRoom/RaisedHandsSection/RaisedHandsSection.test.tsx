import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import useSessionContext from '@hooks/useSessionContext';
import { SessionContextType } from '@Context/SessionProvider/session';
import { RaiseHandState } from '@app-types/session';
import RaisedHandsSection from './RaisedHandsSection';

vi.mock('@hooks/useSessionContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

const twoHands: RaiseHandState[] = [
  { connectionId: 'conn-a', participantName: 'Alice', raisedHand: true, raisedHandTimestamp: 1000 },
  { connectionId: 'conn-b', participantName: 'Bob', raisedHand: true, raisedHandTimestamp: 2000 },
];

describe('RaisedHandsSection', () => {
  const mockLowerHand = vi.fn();
  const mockLowerAllHands = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 0,
      raisedHands: [],
      lowerHand: mockLowerHand,
      lowerAllHands: mockLowerAllHands,
    } as unknown as SessionContextType);
  });

  it('renders nothing when raisedHandCount is 0', () => {
    render(<RaisedHandsSection />);
    expect(screen.queryByTestId('raised-hands-section')).not.toBeInTheDocument();
  });

  it('renders the section when raisedHandCount > 0', () => {
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 2,
      raisedHands: twoHands,
      lowerHand: mockLowerHand,
      lowerAllHands: mockLowerAllHands,
    } as unknown as SessionContextType);
    render(<RaisedHandsSection />);
    expect(screen.getByTestId('raised-hands-section')).toBeInTheDocument();
  });

  it('displays all participants with raised hands', () => {
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 2,
      raisedHands: twoHands,
      lowerHand: mockLowerHand,
      lowerAllHands: mockLowerAllHands,
    } as unknown as SessionContextType);
    render(<RaisedHandsSection />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows "Lower all" button', () => {
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 2,
      raisedHands: twoHands,
      lowerHand: mockLowerHand,
      lowerAllHands: mockLowerAllHands,
    } as unknown as SessionContextType);
    render(<RaisedHandsSection />);
    expect(screen.getByTestId('lower-all-button')).toBeInTheDocument();
  });

  it('opens confirmation dialog when "Lower all" is clicked', async () => {
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 2,
      raisedHands: twoHands,
      lowerHand: mockLowerHand,
      lowerAllHands: mockLowerAllHands,
    } as unknown as SessionContextType);
    render(<RaisedHandsSection />);
    fireEvent.click(screen.getByTestId('lower-all-button'));
    await waitFor(() => {
      expect(screen.getByTestId('lower-all-dialog')).toBeInTheDocument();
    });
  });

  it('calls lowerAllHands and closes dialog on confirm', async () => {
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 2,
      raisedHands: twoHands,
      lowerHand: mockLowerHand,
      lowerAllHands: mockLowerAllHands,
    } as unknown as SessionContextType);
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
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 2,
      raisedHands: twoHands,
      lowerHand: mockLowerHand,
      lowerAllHands: mockLowerAllHands,
    } as unknown as SessionContextType);
    render(<RaisedHandsSection />);
    fireEvent.click(screen.getByTestId('lower-all-button'));
    await waitFor(() => expect(screen.getByTestId('lower-all-dialog')).toBeInTheDocument());

    fireEvent.click(screen.getByTestId('lower-all-cancel-button'));
    expect(mockLowerAllHands).not.toHaveBeenCalled();
  });

  it('lower individual hand button calls lowerHand with the correct connectionId', () => {
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 2,
      raisedHands: twoHands,
      lowerHand: mockLowerHand,
      lowerAllHands: mockLowerAllHands,
    } as unknown as SessionContextType);
    render(<RaisedHandsSection />);
    fireEvent.click(screen.getByTestId('lower-hand-conn-a'));
    expect(mockLowerHand).toHaveBeenCalledWith('conn-a');
  });
});
