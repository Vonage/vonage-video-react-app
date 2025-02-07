import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, Mock, expect, beforeEach, afterEach } from 'vitest';
import MobileHeader from './MobileHeader';
import useSessionContext from '../../../hooks/useSessionContext';
import useRoomName from '../../../hooks/useRoomName';
import useRoomShareUrl from '../../../hooks/useRoomShareUrl';

vi.mock('../../../hooks/useSessionContext');
vi.mock('../../../hooks/useRoomName');
vi.mock('../../../hooks/useRoomShareUrl');

describe('MobileHeader component', () => {
  const mockedRoomName = 'test-room-name';
  let originalClipboard: Clipboard;

  beforeEach(() => {
    (useRoomName as Mock).mockReturnValue(mockedRoomName);
    (useRoomShareUrl as Mock).mockReturnValue('https://example.com/room123');

    originalClipboard = navigator.clipboard;
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  afterEach(() => {
    Object.assign(navigator, { clipboard: originalClipboard });
    vi.clearAllMocks();
  });

  it('renders the room name', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });

    render(<MobileHeader />);

    expect(screen.getByText(mockedRoomName)).toBeInTheDocument();
  });

  it('shows the recording icon if it is currently in progress', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: '123-456' });

    render(<MobileHeader />);

    expect(screen.getByTestId('RadioButtonCheckedIcon')).toBeInTheDocument();
  });

  it('does not show the recording icon if it there is not one happening', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });

    render(<MobileHeader />);

    expect(screen.queryByTestId('RadioButtonCheckedIcon')).not.toBeInTheDocument();
  });

  it('copies room share URL to clipboard', async () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    render(<MobileHeader />);

    const copyButton = screen.getByTestId('ContentCopyIcon');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/room123');
      expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
    });
  });
});
