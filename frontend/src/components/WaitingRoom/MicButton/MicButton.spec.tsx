import { render as renderBase, screen, fireEvent, RenderOptions } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AppConfigStore from '@Context/ConfigProvider/AppConfigStore';
import { ConfigProviderBase } from '@Context/ConfigProvider/ConfigProvider';
import React from 'react';
import MicButton from './MicButton';

let isAudioEnabled = true;
const toggleAudioMock = vi.fn();

vi.mock('../../../hooks/usePreviewPublisherContext', () => {
  return {
    default: () => ({
      get isAudioEnabled() {
        return isAudioEnabled;
      },
      toggleAudio: toggleAudioMock,
    }),
  };
});

describe('MicButton', () => {
  beforeEach(() => {
    isAudioEnabled = true;
  });

  it('renders the mic on icon when audio is enabled', () => {
    render(<MicButton />);
    expect(screen.getByTestId('MicIcon')).toBeInTheDocument();
  });

  it('renders the mic off icon when audio is disabled', () => {
    isAudioEnabled = false;
    render(<MicButton />);
    expect(screen.getByTestId('MicOffIcon')).toBeInTheDocument();
  });

  it('calls toggleAudio when clicked', () => {
    render(<MicButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(toggleAudioMock).toHaveBeenCalled();
  });

  it('is not rendered when allowMicrophoneControl is false', () => {
    const configStore = new AppConfigStore({
      audioSettings: {
        allowMicrophoneControl: false,
      },
    });

    render(<MicButton />, {
      wrapper: makeProvidersWrapper({ configStore }),
    });

    expect(screen.queryByTestId('MicIcon')).not.toBeInTheDocument();
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
      audioSettings: {
        allowMicrophoneControl: true,
      },
    });

  const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <ConfigProviderBase value={configStore}>{children}</ConfigProviderBase>
  );

  return Wrapper;
}
