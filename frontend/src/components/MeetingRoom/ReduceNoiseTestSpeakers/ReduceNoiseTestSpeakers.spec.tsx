import { describe, expect, it, vi, afterEach, Mock, beforeEach } from 'vitest';
import { fireEvent, render as renderBase, screen, waitFor } from '@testing-library/react';
import { EventEmitter } from 'stream';
import { Publisher } from '@vonage/client-sdk-video';
import type { ReactElement } from 'react';
import { defaultAudioDevice } from '@utils/mockData/device';
import usePublisherContext from '@hooks/usePublisherContext';
import { PublisherContextType } from '@Context/PublisherProvider';
import { makeTestProvider } from '@test/providers';
import { makeMediaDeviceInfos } from '@web-test/fixtures';
import { mediaDevices$ } from '@core/stores';
import ReduceNoiseTestSpeakers from './ReduceNoiseTestSpeakers';
import { env } from '../../../env';

vi.mock('@hooks/usePublisherContext');

const mockUsePublisherContext = usePublisherContext as Mock<[], PublisherContextType>;

const { mockHasMediaProcessorSupport } = vi.hoisted(() => {
  return { mockHasMediaProcessorSupport: vi.fn().mockReturnValue(true) };
});
vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
}));

describe('ReduceNoiseTestSpeakers', () => {
  let mockPublisher: Publisher;
  let publisherContext: PublisherContextType;

  beforeEach(() => {
    mediaDevices$.reset();

    // Mock HTMLMediaElement methods used by SoundTest component
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});

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

    mockUsePublisherContext.mockImplementation(() => publisherContext);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the component with the correct elements', () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);

    render(<ReduceNoiseTestSpeakers />);

    expect(screen.getByText('Advanced Noise Suppression')).toBeInTheDocument();
    expect(screen.getByLabelText('Advanced Noise Suppression')).not.toBeChecked();
  });

  it('does not render the component if media processor is not supported', () => {
    mockHasMediaProcessorSupport.mockReturnValue(false);

    render(<ReduceNoiseTestSpeakers />);

    expect(screen.queryByText('Advanced Noise Suppression')).not.toBeInTheDocument();
  });

  it('toggles the noise suppression state when clicked', async () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);

    render(<ReduceNoiseTestSpeakers />);

    const toggleButton = screen.getByLabelText('Advanced Noise Suppression');
    fireEvent.click(toggleButton);

    await waitFor(() => expect(mockPublisher.applyAudioFilter).toHaveBeenCalledTimes(1));
    expect(mockPublisher.applyAudioFilter).toHaveBeenCalledWith({
      type: 'advancedNoiseSuppression',
    });
    expect(toggleButton).toBeChecked();

    fireEvent.click(toggleButton);
    await waitFor(() => expect(mockPublisher.clearAudioFilter).toHaveBeenCalledTimes(1));
    expect(toggleButton).not.toBeChecked();
  });

  it('should update the UI when toggling the button', async () => {
    mockHasMediaProcessorSupport.mockReturnValue(true);

    render(<ReduceNoiseTestSpeakers />);

    const toggleButton = screen.getByLabelText('Advanced Noise Suppression');

    expect(toggleButton).not.toBeChecked();

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(toggleButton).toBeChecked();
    });

    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(toggleButton).not.toBeChecked();
    });
  });

  it('does not render the Advanced Noise Suppression option if allowAdvancedNoiseSuppression is false', () => {
    env.partialUpdate({
      ALLOW_ADVANCED_NOISE_SUPPRESSION: false,
    });

    render(<ReduceNoiseTestSpeakers />);

    expect(screen.queryByText('Advanced Noise Suppression')).not.toBeInTheDocument();
  });

  it('does not render the SoundTest if no audiooutput devices are available', () => {
    mediaDevices$.reset();

    render(<ReduceNoiseTestSpeakers />);

    expect(screen.queryByTestId('soundTest')).not.toBeInTheDocument();
  });

  it('renders the SoundTest if audiooutput devices are available', () => {
    const devices = makeMediaDeviceInfos();

    mediaDevices$.setState((state) => ({ ...state, mediaDeviceInfo: devices }));

    render(<ReduceNoiseTestSpeakers />);

    expect(screen.getByTestId('soundTest')).toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
