import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import useSessionContext from '@hooks/useSessionContext';
import { SessionContextType } from '@Context/SessionProvider/session';
import SelfLowerPill from './SelfLowerPill';

vi.mock('@hooks/useSessionContext');

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

describe('SelfLowerPill', () => {
  const mockLowerHand = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSessionContext.mockReturnValue({
      localHandIsRaised: false,
      lowerHand: mockLowerHand,
    } as unknown as SessionContextType);
  });

  it('renders nothing when local hand is not raised', () => {
    render(<SelfLowerPill />);
    expect(screen.queryByTestId('self-lower-pill')).not.toBeInTheDocument();
  });

  it('renders the pill when local hand is raised', () => {
    mockUseSessionContext.mockReturnValue({
      localHandIsRaised: true,
      lowerHand: mockLowerHand,
    } as unknown as SessionContextType);
    render(<SelfLowerPill />);
    expect(screen.getByTestId('self-lower-pill')).toBeInTheDocument();
  });

  it('shows "Lower hand" label', () => {
    mockUseSessionContext.mockReturnValue({
      localHandIsRaised: true,
      lowerHand: mockLowerHand,
    } as unknown as SessionContextType);
    render(<SelfLowerPill />);
    expect(screen.getByTestId('self-lower-pill')).toHaveTextContent('Lower hand');
  });

  it('calls lowerHand() on click', () => {
    mockUseSessionContext.mockReturnValue({
      localHandIsRaised: true,
      lowerHand: mockLowerHand,
    } as unknown as SessionContextType);
    render(<SelfLowerPill />);
    fireEvent.click(screen.getByTestId('self-lower-pill'));
    expect(mockLowerHand).toHaveBeenCalledOnce();
  });
});
