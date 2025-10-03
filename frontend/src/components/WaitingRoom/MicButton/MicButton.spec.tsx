import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import MicButton from './MicButton';
import useConfigContext from '../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../Context/ConfigProvider';

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

vi.mock('../../../hooks/useConfigContext');
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

describe('MicButton', () => {
  let mockConfigContext: ConfigContextType;

  beforeEach(() => {
    vi.clearAllMocks();
    isAudioEnabled = true;
    mockConfigContext = {
      audioSettings: {
        allowMicrophoneControl: true,
      },
    } as Partial<ConfigContextType> as ConfigContextType;
    mockUseConfigContext.mockReturnValue(mockConfigContext);
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
    mockConfigContext.audioSettings.allowMicrophoneControl = false;
    render(<MicButton />);
    expect(screen.queryByTestId('MicIcon')).not.toBeInTheDocument();
  });
});
