import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SpatialAudioDebugOverlay from './SpatialAudioDebugOverlay';

describe('SpatialAudioDebugOverlay', () => {
  it('renders the "Stereo Panning Debug" header', () => {
    render(<SpatialAudioDebugOverlay pan={0} />);
    expect(screen.getByText('Stereo Panning Debug')).toBeInTheDocument();
  });

  it('shows centre indicator (●) and grey color for pan near zero', () => {
    render(<SpatialAudioDebugOverlay pan={0} />);
    expect(screen.getByText('● +0.00')).toBeInTheDocument();
  });

  it('shows left indicator (◀) for negative pan beyond threshold', () => {
    render(<SpatialAudioDebugOverlay pan={-0.5} />);
    expect(screen.getByText('◀ -0.50')).toBeInTheDocument();
  });

  it('shows right indicator (▶) for positive pan beyond threshold', () => {
    render(<SpatialAudioDebugOverlay pan={0.75} />);
    expect(screen.getByText('▶ +0.75')).toBeInTheDocument();
  });

  it('treats pan within threshold as centre', () => {
    render(<SpatialAudioDebugOverlay pan={0.04} />);
    expect(screen.getByText('● +0.04')).toBeInTheDocument();
  });

  it('formats positive pan values with a leading +', () => {
    render(<SpatialAudioDebugOverlay pan={1} />);
    expect(screen.getByText('▶ +1.00')).toBeInTheDocument();
  });

  it('formats negative pan values without a leading +', () => {
    render(<SpatialAudioDebugOverlay pan={-1} />);
    expect(screen.getByText('◀ -1.00')).toBeInTheDocument();
  });
});
