import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { Publisher } from '@vonage/client-sdk-video';
import type { PublisherContextType } from '@Context/PublisherProvider';
import usePublisherContext from '@hooks/usePublisherContext';
import type { advancedSettings } from '@Context/AdvancedSettings';
import advancedSettings$ from '@Context/AdvancedSettings';
import AdvancedSettingsAudioTab from './AdvancedSettingsAudioTab';

vi.mock('@hooks/usePublisherContext');

// The advanced noise suppression switch is disabled unless the media processor is supported, which
// jsdom does not provide.
const { mockHasMediaProcessorSupport } = vi.hoisted(() => ({
  mockHasMediaProcessorSupport: vi.fn().mockReturnValue(true),
}));

vi.mock('@vonage/client-sdk-video', () => ({
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
}));

const mockPublisher = {
  applyAudioFilter: vi.fn().mockResolvedValue(undefined),
  clearAudioFilter: vi.fn().mockResolvedValue(undefined),
} as unknown as Publisher;

describe('AdvancedSettingsAudioTab', () => {
  beforeEach(() => {
    mockHasMediaProcessorSupport.mockReturnValue(true);
    vi.mocked(usePublisherContext).mockReturnValue({
      publisher: mockPublisher,
    } as unknown as PublisherContextType);
    vi.mocked(mockPublisher.applyAudioFilter).mockResolvedValue(undefined);
    vi.mocked(mockPublisher.clearAudioFilter).mockResolvedValue(undefined);
  });

  afterEach(() => {
    advancedSettings$.reset();
  });

  it('renders all audio controls with automatic bitrate selected by default', () => {
    render(<AdvancedSettingsAudioTab />);

    expect(screen.getByRole('heading', { name: /^audio$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/audio bitrate/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('automatic');
    expect(
      screen.queryByTestId('advanced-settings-custom-audio-bitrate-slider')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText(/enable opus dtx/i)).toBeChecked();
    expect(screen.getByLabelText(/publisher audio fallback/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subscriber audio fallback/i)).toBeInTheDocument();
  });

  it('renders the custom audio bitrate slider when custom mode is selected', () => {
    render(<AdvancedSettingsAudioTab />, { dialogState: { audioBitrateMode: 'custom' } });

    expect(screen.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeInTheDocument();
    expect(screen.getByText(/6 kbps/i)).toBeInTheDocument();
    expect(screen.getByText(/510 kbps/i)).toBeInTheDocument();
    expect(screen.getByText(/128 kbps/i)).toBeInTheDocument();
  });

  it('shows custom slider after selecting custom bitrate mode', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsAudioTab />);

    await user.selectOptions(screen.getByRole('combobox'), 'custom');

    expect(screen.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeInTheDocument();
  });

  it('toggles enable opus dtx checkbox', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsAudioTab />);

    await user.click(screen.getByRole('checkbox', { name: /enable opus dtx/i }));

    expect(screen.getByRole('checkbox', { name: /enable opus dtx/i })).not.toBeChecked();
  });

  it('applies advanced noise suppression to the running publisher, not just the store', async () => {
    const user = userEvent.setup();
    render(<AdvancedSettingsAudioTab />);

    const toggle = screen.getByRole('checkbox', { name: /advanced noise suppression/i });

    await user.click(toggle);
    expect(mockPublisher.applyAudioFilter).toHaveBeenCalledWith({
      type: 'advancedNoiseSuppression',
    });
    expect(advancedSettings$.getState().advancedNoiseSuppressionEnabled).toBe(true);

    await user.click(toggle);
    expect(mockPublisher.clearAudioFilter).toHaveBeenCalled();
    expect(advancedSettings$.getState().advancedNoiseSuppressionEnabled).toBe(false);
  });
});
type RenderOptions = {
  dialogState?: Partial<advancedSettings>;
  initialPath?: string;
};
function render(
  ui: ReactElement,
  { dialogState, initialPath = '/waiting-room' }: RenderOptions = {}
) {
  if (dialogState) {
    advancedSettings$.setState((state) => ({ ...state, ...dialogState }));
  }

  return renderBase(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>);
}
