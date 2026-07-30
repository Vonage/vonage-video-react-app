import { describe, expect, it, vi, afterEach, beforeEach } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { makeTestProvider } from '@test/providers';
import { makeMediaDeviceInfos } from '@web-test/fixtures';
import { mediaDevices$ } from '@core/stores';
import ReduceNoiseTestSpeakers from './ReduceNoiseTestSpeakers';

describe('ReduceNoiseTestSpeakers', () => {
  beforeEach(() => {
    mediaDevices$.reset();

    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'load').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
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

  it('no longer offers Advanced Noise Suppression, which now lives in Settings -> Audio', () => {
    const devices = makeMediaDeviceInfos();

    mediaDevices$.setState((state) => ({ ...state, mediaDeviceInfo: devices }));

    render(<ReduceNoiseTestSpeakers />);

    expect(screen.queryByText('Advanced Noise Suppression')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
