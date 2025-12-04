import { render, screen } from '@testing-library/react';
import { describe, beforeEach, it, Mock, vi, expect } from 'vitest';
import MenuDevices from './MenuDevices';
import * as util from '@utils/util';

vi.mock('@utils/util', async () => {
  const actual = await vi.importActual<typeof import('@utils/util')>('@utils/util');
  return {
    ...actual,
    isGetActiveAudioOutputDeviceSupported: vi.fn(),
  };
});

describe('MenuDevices Component', () => {
  const mockDevices = [
    { deviceId: '12345', label: 'Device 1' },
    { deviceId: '2', label: 'Device 2' },
  ];

  const mockOnClose = vi.fn();
  const mockDeviceChangeHandler = vi.fn();
  const anchorEl = document.createElement('div');

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders device menu items if the browser supports it', () => {
    (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(true);

    render(
      <MenuDevices
        devices={mockDevices}
        onClose={mockOnClose}
        open
        anchorEl={anchorEl}
        localSource="1"
        deviceChangeHandler={mockDeviceChangeHandler}
        deviceType="audioInput"
      />
    );

    mockDevices.forEach((device) => {
      expect(screen.queryByText(device.label)).toBeInTheDocument();
    });
  });

  it('does not render device menu items if the browser does not support it', () => {
    (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(false);

    render(
      <MenuDevices
        devices={mockDevices}
        onClose={mockOnClose}
        open
        anchorEl={anchorEl}
        localSource="1"
        deviceChangeHandler={mockDeviceChangeHandler}
        deviceType="audioOutput"
      />
    );

    mockDevices.forEach((device) => {
      expect(screen.queryByText(device.label)).not.toBeInTheDocument();
    });
  });
});
