import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSettingsVideoTab from './AdvancedSettingsVideoTab';

describe('AdvancedSettingsVideoTab', () => {
  it('renders all video sections', () => {
    render(
      <AdvancedSettingsVideoTab
        bitrateMode="default"
        setBitrateMode={vi.fn()}
        codecMode="automatic"
        setCodecMode={vi.fn()}
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
});
