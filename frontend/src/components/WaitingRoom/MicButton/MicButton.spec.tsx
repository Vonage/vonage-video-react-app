import { render as renderBase, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReactElement } from 'react';
import { AppConfigProviderWrapperOptions, makeAppConfigProviderWrapper } from '@test/providers';
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
    expect(screen.getByTestId('vivid-icon-microphone-line')).toBeInTheDocument();
  });

  it('renders the mic off icon when audio is disabled', () => {
    isAudioEnabled = false;
    render(<MicButton />);
    expect(screen.getByTestId('vivid-icon-mic-mute-line')).toBeInTheDocument();
  });

  it('calls toggleAudio when clicked', () => {
    render(<MicButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(toggleAudioMock).toHaveBeenCalled();
  });

  it('is not rendered when allowMicrophoneControl is false', () => {
    render(<MicButton />, {
      appConfigOptions: {
        value: {
          audioSettings: {
            allowMicrophoneControl: false,
          },
        },
      },
    });

    expect(screen.queryByTestId('vivid-icon-microphone-line')).not.toBeInTheDocument();
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
