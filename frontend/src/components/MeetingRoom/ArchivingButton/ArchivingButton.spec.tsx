import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { startArchiving } from '../../../api/archiving';
import ArchivingButton from './ArchivingButton';
import useRoomName from '../../../hooks/useRoomName';

vi.mock('../../../hooks/useSessionContext', () => ({
  default: () => ({
    subscriberWrappers: [],
    tokenRole: 'admin',
  }),
}));
vi.mock('../../../hooks/useRoomName');

vi.mock('../../../api/archiving', () => ({
  startArchiving: vi.fn(),
  stopArchiving: vi.fn(),
}));

describe('ArchivingButton', () => {
  const mockHandleCloseMenu = vi.fn();
  const mockSetErrorState = vi.fn();
  const mockedRoomName = 'test-room-name';

  beforeEach(() => {
    vi.clearAllMocks();
    (useRoomName as Mock).mockReturnValue(mockedRoomName);
  });

  it('renders the button correctly', () => {
    render(
      <MemoryRouter>
        <ArchivingButton handleClick={mockHandleCloseMenu} setErrorState={mockSetErrorState} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('archiving-button')).toBeInTheDocument();
  });

  it('opens the modal when the button is clicked', () => {
    render(
      <MemoryRouter>
        <ArchivingButton handleClick={mockHandleCloseMenu} setErrorState={mockSetErrorState} />
      </MemoryRouter>
    );
    act(() => screen.getByTestId('archiving-button').click());
    expect(screen.getByText('Start Recording?')).toBeInTheDocument();
  });

  it('triggers the start archiving when button is pressed', async () => {
    (startArchiving as Mock).mockResolvedValue({ data: { success: true } });
    render(
      <MemoryRouter>
        <ArchivingButton handleClick={mockHandleCloseMenu} setErrorState={mockSetErrorState} />
      </MemoryRouter>
    );

    act(() => screen.getByTestId('archiving-button').click());
    expect(screen.getByText('Start Recording?')).toBeInTheDocument();

    // click the button to start archiving
    act(() => screen.getByTestId('popup-dialog-primary-button').click());
    await waitFor(() => {
      expect(startArchiving).toHaveBeenCalledWith(mockedRoomName, 'admin');
    });
  });
});
