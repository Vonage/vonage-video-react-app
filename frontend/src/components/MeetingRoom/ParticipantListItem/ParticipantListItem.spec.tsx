import { describe, expect, it, beforeEach, vi, Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stream } from '@vonage/client-sdk-video';
import ParticipantListItem, { ParticipantListItemProps } from './ParticipantListItem';
import useAudioLevels from '../../../hooks/useAudioLevels';
import usePublisherContext from '../../../hooks/usePublisherContext';
import { PublisherContextType } from '../../../Context/PublisherProvider';

vi.mock('../../../hooks/useAudioLevels');
vi.mock('../../../hooks/usePublisherContext');

const mockUseAudioLevels = useAudioLevels as Mock<[], number | undefined>;
const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;

describe('ParticipantListItem', () => {
  const mockStream: Stream = {
    connection: { connectionId: 'mock-connection-id', creationTime: Date.now(), data: 'mockData' },
    streamId: 'mock-stream-id',
    creationTime: Date.now(),
    hasAudio: true,
    hasVideo: false,
    name: 'John Doe',
    videoDimensions: { width: 640, height: 480 },
    videoType: 'camera',
    frameRate: 1,
    initials: 'JD',
  };
  const defaultProps: ParticipantListItemProps = {
    audioLevel: 50,
    avatarColor: 'rgb(0, 0, 255)',
    initials: mockStream.initials,
    hasAudio: true,
    stream: mockStream,
    name: 'John Doe',
    dataTestId: 'participant-list-item',
  };

  it('renders the participant name', () => {
    render(<ParticipantListItem {...defaultProps} />);
    const nameElement = screen.getByTestId('participant-list-name');
    expect(nameElement).toHaveTextContent('John Doe');
  });

  it('applies the correct avatar color', () => {
    render(<ParticipantListItem {...defaultProps} />);
    const avatarElement = screen.getByText('JD');
    expect(avatarElement).toHaveStyle(`background-color: ${defaultProps.avatarColor}`);
  });

  it('renders the initials in the Avatar', () => {
    render(<ParticipantListItem {...defaultProps} />);
    const avatarElement = screen.getByText('JD');
    expect(avatarElement).toBeInTheDocument();
  });

  it('renders the ListItem with correct height and data-testid', () => {
    render(<ParticipantListItem {...defaultProps} />);
    const listItem = screen.getByTestId('participant-list-item');
    expect(listItem).toBeInTheDocument();
    expect(listItem).toHaveStyle({ height: '56px' });
  });

  it('handles long participant names with noWrap styling', () => {
    render(
      <ParticipantListItem
        {...defaultProps}
        name="A very long participant name that should be truncated"
      />
    );
    const nameElement = screen.getByTestId('participant-list-name');
    expect(nameElement).toHaveTextContent('A very long participant name that should be truncated');
    expect(nameElement).toHaveStyle({ whiteSpace: 'nowrap' });
  });

  it('uses the correct Avatar dimensions and font size', () => {
    render(<ParticipantListItem {...defaultProps} />);
    const avatarElement = screen.getByText('JD');
    expect(avatarElement).toHaveStyle({
      width: '32px',
      height: '32px',
      fontSize: '14px',
    });
  });

  describe('Publisher audio state handling', () => {
    let publisherContext: PublisherContextType;
    beforeEach(() => {
      publisherContext = {
        isAudioEnabled: true,
      } as unknown as PublisherContextType;
      mockUsePublisherContext.mockImplementation(() => publisherContext);
      mockUseAudioLevels.mockReturnValue(50);
    });

    it('shows active audio state for publisher when microphone is enabled', () => {
      mockUsePublisherContext.mockImplementation(() => ({
        ...publisherContext,
        isAudioEnabled: true,
      }));
      mockUseAudioLevels.mockReturnValue(75);

      render(<ParticipantListItem {...defaultProps} audioLevel={undefined} hasAudio />);

      const participantItem = screen.getByTestId('participant-list-item');
      expect(participantItem).toBeInTheDocument();

      const audioIndicator = screen.getByTestId('audio-indicator');
      expect(audioIndicator).toBeInTheDocument();

      const micIcon = screen.getByTestId('MicIcon');
      expect(micIcon).toBeInTheDocument();
    });

    it('shows muted state when hasAudio is false', () => {
      render(<ParticipantListItem {...defaultProps} audioLevel={undefined} hasAudio={false} />);

      const participantItem = screen.getByTestId('participant-list-item');
      expect(participantItem).toBeInTheDocument();

      const audioIndicator = screen.getByTestId('audio-indicator');
      expect(audioIndicator).toBeInTheDocument();

      const micOffIcon = screen.getByTestId('MicOffIcon');
      expect(micOffIcon).toBeInTheDocument();
    });
  });
});
