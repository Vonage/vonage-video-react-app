import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { Subscriber } from '@vonage/client-sdk-video';
import { SubscriberWrapper } from '../../types/session';
import HiddenParticipantsTile from './index';
import useConfigContext from '../../hooks/useConfigContext';
import { ConfigContextType } from '../../Context/ConfigProvider';

const mockToggleParticipantList = vi.fn();
vi.mock('../../hooks/useSessionContext', () => ({
  __esModule: true,
  default: () => ({
    toggleParticipantList: mockToggleParticipantList,
  }),
}));
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;
vi.mock('../../hooks/useConfigContext');

describe('HiddenParticipantsTile', () => {
  let configContext: ConfigContextType;
  const box = { height: 100, width: 100, top: 0, left: 0 };
  const hiddenSubscribers = [
    {
      element: document.createElement('video'),
      subscriber: {
        id: '1',
        stream: {
          name: 'John Doe',
          streamId: '1',
          initials: 'JD',
        } as Partial<Subscriber['stream']>,
        getAudioVolume: vi.fn(() => 1),
        getImgData: vi.fn(() => null),
        getStats: vi.fn(),
        getRtcStatsReport: vi.fn(() => Promise.resolve(new Map())),
      } as Partial<Subscriber>,
      isScreenshare: false,
      id: '1',
      isPinned: false,
    },
  ];

  beforeEach(() => {
    configContext = {
      meetingRoomSettings: {
        showParticipantList: true,
      },
    } as unknown as ConfigContextType;
    mockUseConfigContext.mockReturnValue(configContext);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should display two hidden participants', async () => {
    const currentHiddenSubscribers = [
      ...hiddenSubscribers,
      {
        element: document.createElement('video'),
        subscriber: {
          id: '2',
          stream: {
            name: 'Jane Smith',
            streamId: '2',
            initials: 'JS',
          } as Partial<Subscriber['stream']>,
          getAudioVolume: vi.fn(() => 1),
          getImgData: vi.fn(() => null),
          getStats: vi.fn(),
          getRtcStatsReport: vi.fn(() => Promise.resolve(new Map())),
        } as Partial<Subscriber>,
        isScreenshare: false,
        id: '2',
        isPinned: false,
      },
    ] as SubscriberWrapper[];

    render(<HiddenParticipantsTile box={box} hiddenSubscribers={currentHiddenSubscribers} />);

    const button = screen.getByTestId('hidden-participants');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);

    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.getByText('JS')).toBeInTheDocument();

    expect(mockToggleParticipantList).toHaveBeenCalled();
  });

  it('should display one hidden participant because the other one is empty', async () => {
    const currentHiddenSubscribers = [...hiddenSubscribers, {}] as SubscriberWrapper[];

    render(<HiddenParticipantsTile box={box} hiddenSubscribers={currentHiddenSubscribers} />);

    const button = screen.getByTestId('hidden-participants');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);

    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(screen.queryByText('JS')).not.toBeInTheDocument();

    expect(mockToggleParticipantList).toHaveBeenCalled();
  });

  it('does not toggle participant list when showParticipantList is disabled', async () => {
    const currentHiddenSubscribers = [...hiddenSubscribers, {}] as SubscriberWrapper[];
    mockUseConfigContext.mockReturnValue({
      meetingRoomSettings: {
        showParticipantList: false,
      },
    } as unknown as ConfigContextType);

    render(<HiddenParticipantsTile box={box} hiddenSubscribers={currentHiddenSubscribers} />);

    const button = screen.getByTestId('hidden-participants');
    expect(button).toBeInTheDocument();
    await userEvent.click(button);

    expect(mockToggleParticipantList).not.toHaveBeenCalled();
  });
});
