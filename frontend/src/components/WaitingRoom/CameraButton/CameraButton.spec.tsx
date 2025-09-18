import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import CameraButton from './CameraButton';
import useConfigContext from '../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../Context/ConfigProvider';

let isVideoEnabled = true;
const toggleVideoMock = vi.fn();
const toggleBackgroundVideoMock = vi.fn();

vi.mock('../../../hooks/usePreviewPublisherContext', () => {
  return {
    default: () => ({
      get isVideoEnabled() {
        return isVideoEnabled;
      },
      toggleVideo: toggleVideoMock,
    }),
  };
});
vi.mock('../../../hooks/useBackgroundPublisherContext', () => {
  return {
    default: () => ({
      toggleVideo: toggleBackgroundVideoMock,
    }),
  };
});

vi.mock('../../../hooks/useConfigContext');
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

describe('CameraButton', () => {
  let mockConfigContext: ConfigContextType;

  beforeEach(() => {
    vi.clearAllMocks();
    isVideoEnabled = true;
    mockConfigContext = {
      videoSettings: {
        allowCameraControl: true,
      },
    } as unknown as ConfigContextType;
    mockUseConfigContext.mockReturnValue(mockConfigContext);
  });

  it('renders the video on icon when video is enabled', () => {
    render(<CameraButton />);
    expect(screen.getByTestId('VideocamIcon')).toBeInTheDocument();
  });

  it('renders the video off icon when video is disabled', () => {
    isVideoEnabled = false;
    render(<CameraButton />);
    expect(screen.getByTestId('VideocamOffIcon')).toBeInTheDocument();
  });

  it('updates the main publisher and the background replacement publisher when clicked', () => {
    render(<CameraButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(toggleVideoMock).toHaveBeenCalled();
    expect(toggleBackgroundVideoMock).toHaveBeenCalled();
  });

  it('is not rendered when allowCameraControl is false', () => {
    mockConfigContext.videoSettings.allowCameraControl = false;
    render(<CameraButton />);
    expect(screen.queryByTestId('VideocamIcon')).not.toBeInTheDocument();
  });
});
