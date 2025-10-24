import { render as renderBase, screen, fireEvent, RenderOptions } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppConfigStore from '@Context/ConfigProvider/AppConfigStore';
import { ConfigProviderBase } from '@Context/ConfigProvider/ConfigProvider';
import React from 'react';
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
    const configStore = new AppConfigStore({
      videoSettings: {
        allowCameraControl: false,
      },
    });

    render(<CameraButton />, {
      wrapper: makeProvidersWrapper({ configStore }),
    });
    expect(screen.queryByTestId('VideocamIcon')).not.toBeInTheDocument();
  });
});

function render(ui: React.ReactElement, options?: RenderOptions) {
  const Wrapper = options?.wrapper ?? makeProvidersWrapper();
  return renderBase(ui, { ...options, wrapper: Wrapper });
}

function makeProvidersWrapper(providers?: { configStore?: AppConfigStore }) {
  const configStore =
    providers?.configStore ??
    new AppConfigStore({
      videoSettings: {
        allowCameraControl: true,
      },
    });

  const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <ConfigProviderBase value={configStore}>{children}</ConfigProviderBase>
  );

  return Wrapper;
}
