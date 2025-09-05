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
import usePublisherContext from '../../../hooks/usePublisherContext';
import { PublisherContextType } from '../../../Context/PublisherProvider';
import useAudioLevels from '../../../hooks/useAudioLevels';
import ParticipantListItem from '../ParticipantListItem';

const mockedRoomName = { roomName: 'test-room-name' };

vi.mock('../../../hooks/useSessionContext.tsx');
vi.mock('../../../hooks/usePublisherContext.tsx');
vi.mock('../../../hooks/useAudioLevels.tsx');
vi.mock('../../../hooks/useUserContext');
vi.mock('../../../hooks/useRoomShareUrl');
vi.mock('../ParticipantListItem', () => ({
  default: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useParams: () => mockedRoomName,
}));
const mockParticipantListItem = vi.mocked(ParticipantListItem);

const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const mockNavigate = vi.fn();

const mockUseUserContext = useUserContext as Mock<[], UserContextType>;
const mockUserContextWithDefaultSettings = {
  user: {
    defaultSettings: {
      name: 'Local Participant',
    },
  },
} as UserContextType;
const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;
const mockUseAudioLevels = useAudioLevels as Mock<[], number | undefined>;

mockUseUserContext.mockImplementation(() => mockUserContextWithDefaultSettings);

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
  let publisherContext: PublisherContextType;

  beforeEach(() => {
    vi.clearAllMocks();

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

    publisherContext = {
      isAudioEnabled: true,
    } as unknown as PublisherContextType;
    mockUsePublisherContext.mockImplementation(() => publisherContext);
    mockUseAudioLevels.mockReturnValue(50);

    mockParticipantListItem.mockImplementation(({ dataTestId, name }) => (
      <div data-testid={dataTestId}>{name}</div>
    ));
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
    mockParticipantListItem.mockImplementation(({ name, dataTestId }) => (
      <div data-testid={dataTestId}>
        <span data-testid="participant-list-name">{name}</span>
      </div>
    ));

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

  describe('Publisher audio state handling', () => {
    beforeEach(() => {
      mockParticipantListItem.mockImplementation(({ audioLevel, hasAudio, name, dataTestId }) => (
        <div data-testid={dataTestId}>
          <span data-testid="participant-list-name">{name}</span>
          <span data-testid={`audio-level-${dataTestId}`}>{audioLevel ?? 'undefined'}</span>
          <span data-testid={`has-audio-${dataTestId}`}>{hasAudio?.toString() ?? 'undefined'}</span>
        </div>
      ));
    });

    it('shows active audio state for publisher when microphone is enabled', () => {
      mockUsePublisherContext.mockImplementation(() => ({
        ...publisherContext,
        isAudioEnabled: true,
      }));
      mockUseAudioLevels.mockReturnValue(75);

      render(<ParticipantList isOpen handleClose={() => {}} />);

      const publisherItem = screen.getByTestId('participant-list-item-you');
      expect(publisherItem).toBeInTheDocument();

      expect(screen.getByTestId('audio-level-participant-list-item-you')).toHaveTextContent('75');
      expect(screen.getByTestId('has-audio-participant-list-item-you')).toHaveTextContent('true');
    });

    it('shows muted state for publisher when microphone is disabled', () => {
      mockUsePublisherContext.mockImplementation(() => ({
        ...publisherContext,
        isAudioEnabled: false,
      }));
      mockUseAudioLevels.mockReturnValue(75);

      render(<ParticipantList isOpen handleClose={() => {}} />);

      const publisherItem = screen.getByTestId('participant-list-item-you');
      expect(publisherItem).toBeInTheDocument();

      expect(screen.getByTestId('audio-level-participant-list-item-you')).toHaveTextContent(
        'undefined'
      );
      expect(screen.getByTestId('has-audio-participant-list-item-you')).toHaveTextContent('false');
    });

    it('displays muted indicator even when audio levels are detected but microphone is off', () => {
      mockUsePublisherContext.mockImplementation(() => ({
        ...publisherContext,
        isAudioEnabled: false,
      }));
      mockUseAudioLevels.mockReturnValue(100);

      render(<ParticipantList isOpen handleClose={() => {}} />);

      const publisherItem = screen.getByTestId('participant-list-item-you');
      expect(publisherItem).toBeInTheDocument();

      expect(screen.getByTestId('audio-level-participant-list-item-you')).toHaveTextContent(
        'undefined'
      );
      expect(screen.getByTestId('has-audio-participant-list-item-you')).toHaveTextContent('false');
    });

    it('shows quiet state when microphone is enabled but no audio activity detected', () => {
      mockUsePublisherContext.mockImplementation(() => ({
        ...publisherContext,
        isAudioEnabled: true,
      }));
      mockUseAudioLevels.mockReturnValue(0);

      render(<ParticipantList isOpen handleClose={() => {}} />);

      expect(screen.getByTestId('audio-level-participant-list-item-you')).toHaveTextContent('0');
      expect(screen.getByTestId('has-audio-participant-list-item-you')).toHaveTextContent('true');
    });

    it('handles publisher audio state when audio levels are unavailable', () => {
      mockUsePublisherContext.mockImplementation(() => ({
        ...publisherContext,
        isAudioEnabled: true,
      }));
      mockUseAudioLevels.mockReturnValue(undefined);

      render(<ParticipantList isOpen handleClose={() => {}} />);

      expect(screen.getByTestId('audio-level-participant-list-item-you')).toHaveTextContent(
        'undefined'
      );
      expect(screen.getByTestId('has-audio-participant-list-item-you')).toHaveTextContent('true');
    });
  });
});
