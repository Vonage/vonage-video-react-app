import { render as renderBase, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactElement } from 'react';
import { AppConfigProviderWrapperOptions, makeAppConfigProviderWrapper } from '@test/providers';
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

describe('CameraButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isVideoEnabled = true;
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
    render(<CameraButton />, {
      appConfigOptions: {
        value: {
          isAppConfigLoaded: true,
          videoSettings: {
            allowCameraControl: false,
          },
        },
      },
    });

    expect(screen.queryByTestId('VideocamIcon')).not.toBeInTheDocument();
  });
});

function render(
  ui: ReactElement,
  options?: {
    appConfigOptions?: AppConfigProviderWrapperOptions;
  }
) {
  const { AppConfigWrapper } = makeAppConfigProviderWrapper(options?.appConfigOptions);

  return renderBase(ui, { ...options, wrapper: AppConfigWrapper });
}
