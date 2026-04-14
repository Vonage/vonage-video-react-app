import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsAudioTab from './AdvancedSettingsAudioTab';
import { ADVANCED_SETTINGS_AUDIO_BITRATE_MODE } from '../AdvancedSettingsDialog.types';

const AUTOMATIC_AUDIO_BITRATE_MODE_VALUE = 'automatic';
const CUSTOM_AUDIO_BITRATE_MODE_VALUE = 'custom';

describe('AdvancedSettingsAudioTab', () => {
  it('renders all audio controls with automatic bitrate selected by default', () => {
    render(
      <AdvancedSettingsAudioTab
        audioBitrateMode={ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.automatic}
        setAudioBitrateMode={vi.fn()}
        customAudioBitrate={128}
        setCustomAudioBitrate={vi.fn()}
        enableDtx={false}
        setEnableDtx={vi.fn()}
        publisherAudioFallbackEnabled={false}
        setPublisherAudioFallbackEnabled={vi.fn()}
        subscriberAudioFallbackEnabled={false}
        setSubscriberAudioFallbackEnabled={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /^audio$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /audio bitrate/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue(AUTOMATIC_AUDIO_BITRATE_MODE_VALUE);
    expect(
      screen.queryByTestId('advanced-settings-custom-audio-bitrate-slider')
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /enable opus dtx/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /publisher audio fallback/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /subscriber audio fallback/i })).toBeInTheDocument();
  });

  it('renders the custom audio bitrate slider when custom mode is selected', () => {
    render(
      <AdvancedSettingsAudioTab
        audioBitrateMode={ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.custom}
        setAudioBitrateMode={vi.fn()}
        customAudioBitrate={128}
        setCustomAudioBitrate={vi.fn()}
        enableDtx={false}
        setEnableDtx={vi.fn()}
        publisherAudioFallbackEnabled={false}
        setPublisherAudioFallbackEnabled={vi.fn()}
        subscriberAudioFallbackEnabled={false}
        setSubscriberAudioFallbackEnabled={vi.fn()}
      />
    );

    expect(screen.getByTestId('advanced-settings-custom-audio-bitrate-slider')).toBeInTheDocument();
    expect(screen.getByText(/6 kbps/i)).toBeInTheDocument();
    expect(screen.getByText(/510 kbps/i)).toBeInTheDocument();
    expect(screen.getByText(/128 kbps/i)).toBeInTheDocument();
  });

  it('calls onChange when selecting custom bitrate mode', async () => {
    const user = userEvent.setup();
    const setAudioBitrateMode = vi.fn();

    render(
      <AdvancedSettingsAudioTab
        audioBitrateMode={ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.automatic}
        setAudioBitrateMode={setAudioBitrateMode}
        customAudioBitrate={128}
        setCustomAudioBitrate={vi.fn()}
        enableDtx={false}
        setEnableDtx={vi.fn()}
        publisherAudioFallbackEnabled={false}
        setPublisherAudioFallbackEnabled={vi.fn()}
        subscriberAudioFallbackEnabled={false}
        setSubscriberAudioFallbackEnabled={vi.fn()}
      />
    );

    await user.selectOptions(screen.getByRole('combobox'), CUSTOM_AUDIO_BITRATE_MODE_VALUE);

    expect(setAudioBitrateMode).toHaveBeenCalledWith(ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.custom);
  });

  it('calls onChange when toggling enable opus dtx', async () => {
    const user = userEvent.setup();
    const setEnableDtx = vi.fn();

    render(
      <AdvancedSettingsAudioTab
        audioBitrateMode={ADVANCED_SETTINGS_AUDIO_BITRATE_MODE.automatic}
        setAudioBitrateMode={vi.fn()}
        customAudioBitrate={128}
        setCustomAudioBitrate={vi.fn()}
        enableDtx={false}
        setEnableDtx={setEnableDtx}
        publisherAudioFallbackEnabled={false}
        setPublisherAudioFallbackEnabled={vi.fn()}
        subscriberAudioFallbackEnabled={false}
        setSubscriberAudioFallbackEnabled={vi.fn()}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: /enable opus dtx/i }));

    expect(setEnableDtx).toHaveBeenCalledWith(true);
  });
});
