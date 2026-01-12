import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, Mock, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import SmallViewportHeader from './SmallViewportHeader';
import useSessionContext from '@hooks/useSessionContext';
import useRoomName from '@hooks/useRoomName';
import useRoomShareUrl from '@hooks/useRoomShareUrl';
import usePublisherContext from '@hooks/usePublisherContext';
import useDevices from '@hooks/useDevices';
import { allMediaDevices } from '@utils/mockData/device';
import { PublisherContextType } from '@Context/PublisherProvider';
import { AllMediaDevices } from '@app-types/room';

vi.mock('@hooks/useSessionContext');
vi.mock('@hooks/useDevices');
vi.mock('@hooks/useRoomName');
vi.mock('@hooks/useRoomShareUrl');
vi.mock('@hooks/usePublisherContext');

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;
const mockUseDevices = useDevices as Mock<
  [],
  { allMediaDevices: AllMediaDevices; getAllMediaDevices: () => void }
>;

describe('SmallViewportHeader component', () => {
  const mockedRoomName = 'test-room-name';
  const originalClipboard: Clipboard = navigator.clipboard;
  let publisherContext: PublisherContextType;

  beforeAll(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  afterAll(() => {
    Object.assign(navigator, { clipboard: originalClipboard });
  });

  beforeEach(() => {
    (useRoomName as Mock).mockReturnValue(mockedRoomName);
    (useRoomShareUrl as Mock).mockReturnValue('https://example.com/room/test-room-name');

    publisherContext = {
      publisher: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType;

    mockUsePublisherContext.mockReturnValue(publisherContext);
    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the room name', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });

    render(<SmallViewportHeader />);

    expect(screen.getByText(mockedRoomName)).toBeInTheDocument();
  });

  it('shows the recording icon if it is currently in progress', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: '123-456' });

    render(<SmallViewportHeader />);

    expect(screen.getByTestId('RadioButtonCheckedIcon')).toBeInTheDocument();
  });

  it('does not show the recording icon if it there is not one happening', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });

    render(<SmallViewportHeader />);

    expect(screen.queryByTestId('vivid-icon-radio-checked-2-solid')).not.toBeInTheDocument();
  });

  it('copies room share URL to clipboard', async () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    render(<SmallViewportHeader />);

    const copyButton = screen.getByTestId('vivid-icon-copy-line');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'https://example.com/room/test-room-name'
      );
      expect(screen.getByTestId('vivid-icon-check-sent-line')).toBeInTheDocument();
    });
  });

  it('shows the camera switch button when video is enabled', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    mockUsePublisherContext.mockReturnValue({
      publisher: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);

    expect(screen.getByTestId('vivid-icon-camera-switch-line')).toBeInTheDocument();
  });

  it('does not show the camera switch button when video is disabled', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    mockUsePublisherContext.mockReturnValue({
      publisher: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: false,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);

    expect(screen.queryByTestId('vivid-icon-camera-switch-line')).not.toBeInTheDocument();
  });

  it('does not show the camera switch button when only one video input device is available', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    mockUsePublisherContext.mockReturnValue({
      publisher: { cycleVideo: vi.fn() } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    const singleVideoDevice: AllMediaDevices = {
      ...allMediaDevices,
      videoInputDevices: [allMediaDevices.videoInputDevices[0]],
    };

    mockUseDevices.mockReturnValue({
      getAllMediaDevices: vi.fn(),
      allMediaDevices: singleVideoDevice,
    });

    render(<SmallViewportHeader />);

    expect(screen.queryByTestId('vivid-icon-camera-switch-line')).not.toBeInTheDocument();
  });

  it('toggles to the opposite camera device when clicked', () => {
    (useSessionContext as Mock).mockReturnValue({ archiveId: null });
    const setVideoSource = vi.fn();
    const getVideoSource = vi.fn(() => ({
      deviceId: allMediaDevices.videoInputDevices[0].deviceId,
      label: allMediaDevices.videoInputDevices[0].label,
      kind: 'videoInput',
    }));
    mockUsePublisherContext.mockReturnValue({
      publisher: {
        setVideoSource,
        getVideoSource,
      } as unknown as PublisherContextType['publisher'],
      isVideoEnabled: true,
    } as unknown as PublisherContextType);

    render(<SmallViewportHeader />);
    const cameraIcon = screen.getByTestId('vivid-icon-camera-switch-line');
    fireEvent.click(cameraIcon);

    expect(setVideoSource).toHaveBeenCalledTimes(1);
    expect(setVideoSource).toHaveBeenCalledWith(allMediaDevices.videoInputDevices[1].deviceId);
  });
});
