import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsVideoTab from './AdvancedSettingsVideoTab';

describe('AdvancedSettingsVideoTab', () => {
  it('renders all video sections', () => {
    render(
      <AdvancedSettingsVideoTab
        bitrateMode="default"
        setBitrateMode={vi.fn()}
        customVideoBitrate={500_000}
        setCustomVideoBitrate={vi.fn()}
        codecMode="automatic"
        setCodecMode={vi.fn()}
        codecPriority={['vp9', 'vp8', 'h264']}
        setCodecPriority={vi.fn()}
        frameRate={30}
        setFrameRate={vi.fn()}
        resolution="640x480"
        setResolution={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /video/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /bitrate/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /codec/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /frame rate/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /resolution/i })).toBeInTheDocument();
  });

  it('renders codec priority drag and drop when codec mode is manual', () => {
    render(
      <AdvancedSettingsVideoTab
        bitrateMode="default"
        setBitrateMode={vi.fn()}
        customVideoBitrate={500_000}
        setCustomVideoBitrate={vi.fn()}
        codecMode="manual"
        setCodecMode={vi.fn()}
        codecPriority={['vp9', 'vp8', 'h264']}
        setCodecPriority={vi.fn()}
        frameRate={30}
        setFrameRate={vi.fn()}
        resolution="640x480"
        setResolution={vi.fn()}
      />
    );

    expect(screen.getByText(/codec priority/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-vp9')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-vp8')).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-codec-priority-item-h264')).toBeInTheDocument();
  });

  it('renders custom video bitrate controls when bitrate mode is custom', () => {
    render(
      <AdvancedSettingsVideoTab
        bitrateMode="custom"
        setBitrateMode={vi.fn()}
        customVideoBitrate={500_000}
        setCustomVideoBitrate={vi.fn()}
        codecMode="automatic"
        setCodecMode={vi.fn()}
        codecPriority={['vp9', 'vp8', 'h264']}
        setCodecPriority={vi.fn()}
        frameRate={30}
        setFrameRate={vi.fn()}
        resolution="640x480"
        setResolution={vi.fn()}
      />
    );

    expect(screen.getByText(/custom bitrate/i)).toBeInTheDocument();
    expect(screen.getByTestId('advanced-settings-custom-video-bitrate-slider')).toBeInTheDocument();
    expect(screen.getAllByText(/5 kbps/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/^10 Mbps$/i)).toBeInTheDocument();
  });
});
