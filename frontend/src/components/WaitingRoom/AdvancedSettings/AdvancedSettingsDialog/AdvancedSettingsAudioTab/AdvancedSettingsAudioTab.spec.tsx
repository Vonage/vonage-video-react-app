import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsAudioTab from './AdvancedSettingsAudioTab';

describe('AdvancedSettingsAudioTab', () => {
  it('renders all audio controls', () => {
    render(
      <AdvancedSettingsAudioTab
        audioBitrate={128}
        setAudioBitrate={vi.fn()}
        publisherAudioFallbackEnabled={false}
        setPublisherAudioFallbackEnabled={vi.fn()}
        subscriberAudioFallbackEnabled={false}
        setSubscriberAudioFallbackEnabled={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /^audio$/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /audio bitrate/i })).toBeInTheDocument();
    expect(screen.getByText(/6 kbps/i)).toBeInTheDocument();
    expect(screen.getByText(/510 kbps/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /publisher audio fallback/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /subscriber audio fallback/i })).toBeInTheDocument();
  });
});
