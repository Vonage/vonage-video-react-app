import { describe, expect, it, vi, beforeEach, Mock } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { startArchiving, stopArchiving } from '../../../api/archiving';
import ArchivingButton from './ArchivingButton';
import useRoomName from '../../../hooks/useRoomName';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import useConfigContext from '../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../Context/ConfigProvider';

vi.mock('../../../hooks/useSessionContext');
vi.mock('../../../hooks/useRoomName');
vi.mock('../../../hooks/useConfigContext');

vi.mock('../../../api/archiving', () => ({
  startArchiving: vi.fn(),
  stopArchiving: vi.fn(),
}));

describe('ArchivingButton', () => {
  const mockHandleCloseMenu = vi.fn();
  const mockedRoomName = 'test-room-name';
  let sessionContext: SessionContextType;
  let configContext: ConfigContextType;

  const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
  const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;
  const testArchiveId = 'test-archive-id';

  beforeEach(() => {
    vi.clearAllMocks();
    (useRoomName as Mock).mockReturnValue(mockedRoomName);
    sessionContext = {
      subscriberWrappers: [],
      archiveId: null,
    } as unknown as SessionContextType;
    configContext = {
      meetingRoomSettings: {
        showArchiveButton: true,
      },
    } as unknown as ConfigContextType;

    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
    mockUseConfigContext.mockReturnValue(configContext);
  });

  it('renders the button correctly', () => {
    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);
    expect(screen.getByTestId('archiving-button')).toBeInTheDocument();
  });

  it('opens the modal when the button is clicked', () => {
    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);
    act(() => screen.getByTestId('archiving-button').click());
    expect(screen.getByText('Start Recording?')).toBeInTheDocument();
  });

  it('triggers the start archiving when button is pressed', async () => {
    (startArchiving as Mock).mockResolvedValue({ data: { success: true } });
    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);

    act(() => screen.getByTestId('archiving-button').click());
    expect(screen.getByText('Start Recording?')).toBeInTheDocument();

    // click the button to start archiving
    act(() => screen.getByTestId('popup-dialog-primary-button').click());
    await waitFor(() => {
      expect(startArchiving).toHaveBeenCalledWith(mockedRoomName);
    });
  });

  it('shows stop recording dialog when archiving is active', () => {
    mockUseSessionContext.mockReturnValue({
      subscriberWrappers: [],
      archiveId: 'test-archive-id',
    } as unknown as SessionContextType);

    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);
    act(() => screen.getByTestId('archiving-button').click());
    expect(screen.getByText('Stop Recording?')).toBeInTheDocument();
  });

  it('triggers stop archiving when recording is active', async () => {
    mockUseSessionContext.mockReturnValue({
      subscriberWrappers: [],
      archiveId: testArchiveId,
    } as unknown as SessionContextType);

    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);

    act(() => screen.getByTestId('archiving-button').click());
    expect(screen.getByText('Stop Recording?')).toBeInTheDocument();

    // click the button to stop archiving
    act(() => screen.getByTestId('popup-dialog-primary-button').click());
    await waitFor(() => {
      expect(stopArchiving).toHaveBeenCalledWith(mockedRoomName, testArchiveId);
    });
  });

  it('is not rendered when showArchiveButton is disabled', () => {
    mockUseConfigContext.mockReturnValue({
      meetingRoomSettings: {
        showArchiveButton: false,
      },
    } as unknown as ConfigContextType);

    render(<ArchivingButton handleClick={mockHandleCloseMenu} />);
    expect(screen.queryByTestId('archiving-button')).not.toBeInTheDocument();
  });
});
