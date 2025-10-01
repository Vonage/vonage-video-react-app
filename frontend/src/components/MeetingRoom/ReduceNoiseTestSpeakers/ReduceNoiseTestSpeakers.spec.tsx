import { describe, expect, it, vi, afterEach, Mock, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EventEmitter } from 'stream';
import { Publisher } from '@vonage/client-sdk-video';
import { defaultAudioDevice } from '../../../utils/mockData/device';
import usePublisherContext from '../../../hooks/usePublisherContext';
import ReduceNoiseTestSpeakers from './ReduceNoiseTestSpeakers';
import { PublisherContextType } from '../../../Context/PublisherProvider';
import useConfigContext from '../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../Context/ConfigProvider';

vi.mock('../../../hooks/usePublisherContext');
vi.mock('../../../hooks/useConfigContext');

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

const { mockHasMediaProcessorSupport } = vi.hoisted(() => {
  return {
    mockHasMediaProcessorSupport: vi.fn().mockReturnValue(true),
  };
});
vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
}));

describe('ReduceNoiseTestSpeakers', () => {
  let mockPublisher: Publisher;
  let publisherContext: PublisherContextType;
  let configContext: ConfigContextType;

  beforeEach(() => {
    mockPublisher = Object.assign(new EventEmitter(), {
      applyVideoFilter: vi.fn(),
      clearVideoFilter: vi.fn(),
      applyAudioFilter: vi.fn(),
      clearAudioFilter: vi.fn(),
      getAudioSource: () => defaultAudioDevice,
      getAudioFilter: () => null,
      videoWidth: () => 1280,
      videoHeight: () => 720,
    }) as unknown as Publisher;
    publisherContext = {
      publisher: mockPublisher,
      isPublishing: true,
      publish: vi.fn() as () => Promise<void>,
      initializeLocalPublisher: vi.fn(() => {
        publisherContext.publisher = mockPublisher;
      }) as unknown as () => void,
    } as unknown as PublisherContextType;
    configContext = {
      audioSettings: {
        allowAdvancedNoiseSuppression: true,
      },
    } as Partial<ConfigContextType> as ConfigContextType;
    mockUsePublisherContext.mockImplementation(() => publisherContext);
    mockUseConfigContext.mockReturnValue(configContext);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const defaultProps = {
    customLightBlueColor: '#A338E6',
  };

  it('renders the component with the correct elements', () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);

    render(<ReduceNoiseTestSpeakers {...defaultProps} />);

    expect(screen.getByText('Advanced Noise Suppression')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-off-icon')).toBeInTheDocument();
    expect(screen.getByTestId('toggle-on-icon')).toBeInTheDocument();
  });

  it('does not render the component if media processor is not supported', () => {
    mockHasMediaProcessorSupport.mockReturnValue(false);

    render(<ReduceNoiseTestSpeakers {...defaultProps} />);

    expect(screen.queryByText('Advanced Noise Suppression')).not.toBeInTheDocument();
  });

  it('toggles the noise suppression state when clicked', async () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);

    render(<ReduceNoiseTestSpeakers {...defaultProps} />);

    // Click the Advanced Noise Suppression button
    const toggleButton = screen.getByTestId('toggle-on-icon');
    fireEvent.click(toggleButton);

    // Wait for async state change (toggle between on and off)
    await waitFor(() => expect(mockPublisher.applyAudioFilter).toHaveBeenCalledTimes(1));
    expect(mockPublisher.applyAudioFilter).toHaveBeenCalledWith({
      type: 'advancedNoiseSuppression',
    });

    // Click the button again to toggle off
    const toggleOffButton = screen.getByTestId('toggle-off-icon');
    fireEvent.click(toggleOffButton);
    await waitFor(() => expect(mockPublisher.clearAudioFilter).toHaveBeenCalledTimes(1));
  });

  it('should update the UI when toggling the button', async () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);

    render(<ReduceNoiseTestSpeakers {...defaultProps} />);

    const toggleButton = screen.getByText('Advanced Noise Suppression');

    const toggleOffIcon = screen.getByTestId('toggle-off-icon');
    const toggleOnIcon = screen.getByTestId('toggle-on-icon');

    // Check initial state: enabled
    await waitFor(() => {
      const computedStyle = getComputedStyle(toggleOnIcon);
      expect(toggleOnIcon).toBeInTheDocument(); // still in the DOM but with hidden styles
      expect(computedStyle.visibility).toBe('hidden');
    });

    // Click to disable noise suppression
    fireEvent.click(toggleButton);
    await waitFor(() => {
      // After toggling, toggle-off icon should have styles indicating it's hidden
      const computedStyle = getComputedStyle(toggleOffIcon);
      expect(toggleOffIcon).toBeInTheDocument();
      expect(computedStyle.visibility).toBe('hidden');
    });

    // Click to enable noise suppression
    fireEvent.click(toggleButton);
    await waitFor(() => {
      // After toggling, toggle-on icon should have styles indicating it's hidden
      const computedStyle = getComputedStyle(toggleOnIcon);
      expect(toggleOnIcon).toBeInTheDocument();
      expect(computedStyle.visibility).toBe('hidden');
    });
  });

  it('does not render the Advanced Noise Suppression option if allowAdvancedNoiseSuppression is false', () => {
    configContext = {
      audioSettings: {
        allowAdvancedNoiseSuppression: false,
      },
    } as Partial<ConfigContextType> as ConfigContextType;
    mockUseConfigContext.mockReturnValue(configContext);

    render(<ReduceNoiseTestSpeakers {...defaultProps} />);

    expect(screen.queryByText('Advanced Noise Suppression')).not.toBeInTheDocument();
  });
});
