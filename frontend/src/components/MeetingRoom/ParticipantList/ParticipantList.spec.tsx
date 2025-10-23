import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { cleanup, render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { Subscriber as OTSubscriber } from '@vonage/client-sdk-video';
import { useNavigate, useLocation } from 'react-router-dom';
import ParticipantList from './ParticipantList';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import { SubscriberWrapper } from '../../../types/session';
import useUserContext from '../../../hooks/useUserContext';
import { UserContextType } from '../../../Context/user';
import useSessionContext from '../../../hooks/useSessionContext';
import useRoomShareUrl from '../../../hooks/useRoomShareUrl';

const mockedRoomName = { roomName: 'test-room-name' };

vi.mock('../../../hooks/useSessionContext.tsx');
vi.mock('../../../hooks/useUserContext');
vi.mock('../../../hooks/useRoomShareUrl');
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useParams: () => mockedRoomName,
}));
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const mockNavigate = vi.fn();

const mockUserContextWithDefaultSettings = {
  user: {
    defaultSettings: {
      name: 'Local Participant',
    },
  },
} as UserContextType;

const createSubscriberWrapper = (
  name: string,
  id: string,
  isScreenshare: boolean = false
): SubscriberWrapper => {
  const videoType = isScreenshare ? 'screen' : 'camera';
  return {
    id,
    element: document.createElement('video'),
    isPinned: false,
    isScreenshare,
    subscriber: {
      videoWidth: () => 1280,
      videoHeight: () => 720,
      subscribeToVideo: () => {},
      on: vi.fn(),
      off: vi.fn(),
      stream: {
        streamId: id,
        videoType,
        name,
      },
    } as unknown as OTSubscriber,
  };
};

const createTestSubscriberWrappers = () => {
  return [
    createSubscriberWrapper('James Holden', 'sub1'),
    // Screen share subscribers should be hidden in list
    createSubscriberWrapper("James Holden's screen", 'sub1', true),
    createSubscriberWrapper('Alex Kamal', 'sub2'),
    createSubscriberWrapper('Chrisjen Avasarala', 'sub3'),
    createSubscriberWrapper('Amos', 'sub4'),
    createSubscriberWrapper('Naomi Nagata', 'sub5'),
    createSubscriberWrapper('', 'sub6'),
  ];
};

describe('ParticipantList', () => {
  let sessionContext: SessionContextType;
  let originalClipboard: Clipboard;

  beforeEach(() => {
    vi.mocked(useUserContext).mockImplementation(() => mockUserContextWithDefaultSettings);

    originalClipboard = navigator.clipboard;
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
    sessionContext = {
      subscriberWrappers: createTestSubscriberWrappers(),
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
  });
  afterEach(() => {
    Object.assign(navigator, { clipboard: originalClipboard });
    cleanup();
  });

  it('does not render when closed', () => {
    render(<ParticipantList isOpen={false} handleClose={() => {}} />);
    expect(screen.queryByText('Participants')).not.toBeInTheDocument();
  });

  it('copies room share URL to clipboard', async () => {
    (useRoomShareUrl as Mock).mockReturnValue('https://example.com/room123');

    render(<ParticipantList isOpen handleClose={() => {}} />);

    const copyButton = screen.getByTestId('ContentCopyIcon');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com/room123');
      expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
    });
  });

  it('should display remote participants in alphabetical order with local participant first', () => {
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    (useLocation as Mock).mockReturnValue({
      state: mockedRoomName,
    });
    render(<ParticipantList handleClose={() => {}} isOpen />);

    const namesInOrder = screen
      .getAllByTestId('participant-list-item', { exact: false })
      .map((listItem) => {
        return within(listItem).getByTestId('participant-list-name').textContent;
      });
    expect(namesInOrder).toEqual([
      'Local Participant (You)',
      'Alex Kamal',
      'Amos',
      'Chrisjen Avasarala',
      'James Holden',
      'Naomi Nagata',
      '', // Edge case, empty names go at the bottom
    ]);
  });
});
