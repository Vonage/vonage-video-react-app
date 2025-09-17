import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CameraButton from './CameraButton';

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

vi.mock('../../../hooks/useConfigContext', () => {
  return {
    default: () => ({
      videoSettings: {
        allowCameraControl: true,
      },
    }),
  };
});

describe('CameraButton', () => {
  beforeEach(() => {
    isVideoEnabled = true;
    vi.clearAllMocks();
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
});
