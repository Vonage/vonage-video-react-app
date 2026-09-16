import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import EventEmitter from 'events';
import { hasMediaProcessorSupport, type Publisher } from '@vonage/client-sdk-video';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import { makeMediaDeviceInfos, setupWindowNavigatorMock } from '@web-test/fixtures';
import advancedSettings$ from '@Context/AdvancedSettings';
import AdvancedSettingsAudioTab from './AdvancedSettingsAudioTab';

vi.mock('@vonage/client-sdk-video');

const applyAudioFilterSpy = vi.fn();
const clearAudioFilterSpy = vi.fn();

describe('AdvancedSettingsAudioTab', () => {
  beforeEach(() => {
    advancedSettings$.reset();

    // The advanced noise suppression switch is disabled unless the media processor is supported,
    // which jsdom does not provide.
    vi.mocked(hasMediaProcessorSupport).mockReturnValue(true);

    setupWindowNavigatorMock({
      mediaDevices: {
        enumerateDevices: Promise.resolve(makeMediaDeviceInfos()),
      },
    });

    applyAudioFilterSpy.mockResolvedValue(undefined);
    clearAudioFilterSpy.mockResolvedValue(undefined);
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
    advancedSettings$.actions.setAudioBitrateMode('custom');

    render(<AdvancedSettingsAudioTab />);

    expect(screen.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeInTheDocument();
    expect(screen.getByText(/6 kbps/i)).toBeInTheDocument();
    expect(screen.getByText(/510 kbps/i)).toBeInTheDocument();
    expect(screen.getByText(/128 kbps/i)).toBeInTheDocument();
  });

  it('shows custom slider after selecting custom bitrate mode', async () => {
    expect.assertions(1);

    const user = userEvent.setup();
    render(<AdvancedSettingsAudioTab />);

    await user.selectOptions(screen.getByRole('combobox'), 'custom');

    expect(screen.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeInTheDocument();
  });

  it('toggles enable opus dtx checkbox', async () => {
    expect.assertions(1);

    const user = userEvent.setup();
    render(<AdvancedSettingsAudioTab />);

    await user.click(screen.getByRole('checkbox', { name: /enable opus dtx/i }));

    expect(screen.getByRole('checkbox', { name: /enable opus dtx/i })).not.toBeChecked();
  });

  it('applies advanced noise suppression to the running publisher, not just the store', async () => {
    expect.assertions(4);

    const user = userEvent.setup();
    render(<AdvancedSettingsAudioTab />);

    const toggle = screen.getByRole('checkbox', { name: /advanced noise suppression/i });

    await user.click(toggle);
    expect(applyAudioFilterSpy).toHaveBeenCalledWith({ type: 'advancedNoiseSuppression' });
    expect(advancedSettings$.getState().advancedNoiseSuppressionEnabled).toBe(true);

    await user.click(toggle);
    expect(clearAudioFilterSpy).toHaveBeenCalled();
    expect(advancedSettings$.getState().advancedNoiseSuppressionEnabled).toBe(false);
  });

  it('reverts the toggle when the publisher rejects the filter', async () => {
    expect.assertions(2);

    vi.spyOn(console, 'error').mockImplementation(vi.fn());
    applyAudioFilterSpy.mockRejectedValue(new Error('filter unavailable'));

    const user = userEvent.setup();
    render(<AdvancedSettingsAudioTab />);

    await user.click(screen.getByRole('checkbox', { name: /advanced noise suppression/i }));

    expect(advancedSettings$.getState().advancedNoiseSuppressionEnabled).toBe(false);
    expect(screen.getByRole('checkbox', { name: /advanced noise suppression/i })).not.toBeChecked();
  });
});

type RenderOptions = {
  publisherContext?: ProviderOptions['PublisherContext'];
  initialPath?: string;
};

function render(
  ui: ReactElement,
  { publisherContext, initialPath = '/waiting-room' }: RenderOptions = {}
) {
  const publisher = Object.assign(new EventEmitter(), {
    applyAudioFilter: applyAudioFilterSpy,
    clearAudioFilter: clearAudioFilterSpy,
    getVideoSource: vi.fn().mockReturnValue({ track: null }),
    setPreferredFrameRate: vi.fn().mockResolvedValue(undefined),
    setPreferredResolution: vi.fn().mockResolvedValue(undefined),
    setMaxVideoBitrate: vi.fn().mockResolvedValue(undefined),
    setVideoBitratePreset: vi.fn().mockResolvedValue(undefined),
  }) as unknown as Publisher;

  const { wrapper, ...context } = makeTestProvider(
    [providers.runtime, providers.user, providers.session, providers.publisher],
    {
      runtimeContext: undefined,
      userContext: undefined,
      sessionContext: undefined,
      publisherContext: {
        initialValue: {
          publisher,
          isPublishing: true,
          ...publisherContext?.initialValue,
        },
      },
    }
  );

  return {
    ...context,
    ...renderBase(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>, { wrapper }),
  };
}
