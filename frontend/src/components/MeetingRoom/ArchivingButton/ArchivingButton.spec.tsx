import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ArchivingButton from './ArchivingButton';

vi.mock('../../../hooks/useSessionContext', () => ({
  default: () => ({
    subscriberWrappers: [],
  }),
}));
vi.mock('../../../hooks/useRoomName');

vi.mock('../../../api/archiving', () => ({
  startArchiving: vi.fn(),
  stopArchiving: vi.fn(),
}));

describe('ArchivingButton', () => {
  const mockHandleCloseMenu = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the button correctly', () => {
    render(<ArchivingButton handleCloseMenu={mockHandleCloseMenu} />);
    expect(screen.getByTestId('archiving-button')).toBeInTheDocument();
  });

  it('opens the modal when the button is clicked', () => {
    render(<ArchivingButton handleCloseMenu={mockHandleCloseMenu} />);
    fireEvent.click(screen.getByTestId('archiving-button'));
    expect(screen.getByText('Start Recording?')).toBeInTheDocument();
  });
});
