import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import useSessionContext from '@hooks/useSessionContext';
import { SessionContextType } from '@Context/SessionProvider/session';
import { RaiseHandState } from '@app-types/session';
import RaiseHandPill from './RaiseHandPill';

vi.mock('@hooks/useSessionContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

const firstHand: RaiseHandState = {
  connectionId: 'conn-a',
  participantName: 'Alice',
  raisedHand: true,
  raisedHandTimestamp: 1000,
};

describe('RaiseHandPill', () => {
  const mockToggle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 0,
      raisedHands: [],
      toggleParticipantList: mockToggle,
    } as unknown as SessionContextType);
  });

  it('renders nothing when raisedHandCount is 0', () => {
    render(<RaiseHandPill />);
    expect(screen.queryByTestId('raise-hand-pill')).not.toBeInTheDocument();
  });

  it('shows the first-in-queue participant name', () => {
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 1,
      raisedHands: [firstHand],
      toggleParticipantList: mockToggle,
    } as unknown as SessionContextType);
    render(<RaiseHandPill />);
    expect(screen.getByTestId('raise-hand-pill')).toHaveTextContent('Alice');
  });

  it('shows +N when more than one hand is raised', () => {
    const secondHand: RaiseHandState = {
      connectionId: 'conn-b',
      participantName: 'Bob',
      raisedHand: true,
      raisedHandTimestamp: 2000,
    };
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 2,
      raisedHands: [firstHand, secondHand],
      toggleParticipantList: mockToggle,
    } as unknown as SessionContextType);
    render(<RaiseHandPill />);
    expect(screen.getByTestId('raise-hand-pill')).toHaveTextContent('+1');
  });

  it('calls toggleParticipantList on click', () => {
    mockUseSessionContext.mockReturnValue({
      raisedHandCount: 1,
      raisedHands: [firstHand],
      toggleParticipantList: mockToggle,
    } as unknown as SessionContextType);
    render(<RaiseHandPill />);
    fireEvent.click(screen.getByTestId('raise-hand-pill'));
    expect(mockToggle).toHaveBeenCalledOnce();
  });
});
