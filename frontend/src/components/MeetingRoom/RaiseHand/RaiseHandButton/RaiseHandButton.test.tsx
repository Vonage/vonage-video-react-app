import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import useSessionContext from '@hooks/useSessionContext';
import { SessionContextType } from '@Context/SessionProvider/session';
import { useIsHandRaisedFor } from '@core/stores';
import RaiseHandButton from './RaiseHandButton';

vi.mock('@hooks/useSessionContext');
vi.mock('@core/stores', () => ({
  useIsHandRaisedFor: vi.fn(),
}));

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const mockUseIsHandRaisedFor = useIsHandRaisedFor as Mock<[string | undefined], boolean>;

describe('RaiseHandButton', () => {
  const mockRaiseHand = vi.fn();
  const mockLowerHand = vi.fn();
  const mockGetConnectionId = vi.fn(() => 'local-conn');

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSessionContext.mockReturnValue({
      raiseHand: mockRaiseHand,
      lowerHand: mockLowerHand,
      getConnectionId: mockGetConnectionId,
    } as unknown as SessionContextType);
    mockUseIsHandRaisedFor.mockReturnValue(false);
  });

  it('renders "Raise hand" label when hand is not raised', () => {
    render(<RaiseHandButton />);
    expect(screen.getByTestId('raise-hand-button')).toHaveTextContent('Raise hand');
  });

  it('renders "Lower hand" label when hand is raised', () => {
    mockUseIsHandRaisedFor.mockReturnValue(true);
    render(<RaiseHandButton />);
    expect(screen.getByTestId('raise-hand-button')).toHaveTextContent('Lower hand');
  });

  it('has correct aria-pressed when hand is not raised', () => {
    render(<RaiseHandButton />);
    expect(screen.getByTestId('raise-hand-button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('has correct aria-pressed when hand is raised', () => {
    mockUseIsHandRaisedFor.mockReturnValue(true);
    render(<RaiseHandButton />);
    expect(screen.getByTestId('raise-hand-button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls raiseHand() on click when hand is not raised', () => {
    render(<RaiseHandButton />);
    fireEvent.click(screen.getByTestId('raise-hand-button'));
    expect(mockRaiseHand).toHaveBeenCalledOnce();
  });

  it('calls lowerHand() on click when hand is raised', () => {
    mockUseIsHandRaisedFor.mockReturnValue(true);
    render(<RaiseHandButton />);
    fireEvent.click(screen.getByTestId('raise-hand-button'));
    expect(mockLowerHand).toHaveBeenCalledOnce();
  });

  it('shows the ✋ emoji', () => {
    render(<RaiseHandButton />);
    expect(screen.getByTestId('raise-hand-button').textContent).toContain('✋');
  });
});
