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
    render(<MicButton />, {
      appConfigOptions: {
        value: {
          audioSettings: {
            allowMicrophoneControl: false,
          },
        },
      },
    });

    expect(screen.queryByTestId('MicIcon')).not.toBeInTheDocument();
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
