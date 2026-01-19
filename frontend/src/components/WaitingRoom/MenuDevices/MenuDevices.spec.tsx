import { render, screen } from '@testing-library/react';
import { describe, it, vi, expect, beforeAll } from 'vitest';
import userEvent from '@testing-library/user-event';
import makeMediaDeviceInfos from '@common-test/fixtures/makeMediaDeviceInfos';

import MenuDevices from './MenuDevices';
import * as util from '@utils/util';
import mediaDevices$ from '@core/stores/devices';

const someDevices = makeMediaDeviceInfos();

describe('MenuDevices Component', () => {
  beforeAll(() => {
    // Mock enumerateDevices before importing the store to prevent the disruptive mock from throwing
    vi.spyOn(globalThis.navigator.mediaDevices, 'enumerateDevices').mockResolvedValue(someDevices);

    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: someDevices,
    }));
  });

  it('calls deviceChangeHandler and onClose when device is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    const mockDeviceChangeHandler = vi.fn();
    const anchorEl = document.createElement('div');

    const kind = 'audioinput';
    const audioInputDevices = someDevices.filter((d) => d.kind === kind);
    const firstDevice = audioInputDevices[0];
    const secondDevice = audioInputDevices[1];

    render(
      <MenuDevices
        mediaDeviceKind={kind}
        onClose={mockOnClose}
        open
        anchorEl={anchorEl}
        localSource={firstDevice.deviceId}
        deviceChangeHandler={mockDeviceChangeHandler}
      />
    );

    await user.click(screen.getByTestId(`${kind}-menu-item-${secondDevice.deviceId}`));

    expect(mockDeviceChangeHandler).toHaveBeenCalledWith(secondDevice.deviceId);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not render audio output devices when browser does not support it', () => {
    vi.spyOn(util, 'isGetActiveAudioOutputDeviceSupported').mockReturnValue(false);

    const mockOnClose = vi.fn();
    const mockDeviceChangeHandler = vi.fn();
    const anchorEl = document.createElement('div');

    const kind = 'audiooutput';
    const audioOutputDevices = someDevices.filter((d) => d.kind === kind);
    const firstDevice = audioOutputDevices[0];
    const secondDevice = audioOutputDevices[1];

    render(
      <MenuDevices
        mediaDeviceKind={kind}
        onClose={mockOnClose}
        open
        anchorEl={anchorEl}
        localSource={firstDevice.deviceId}
        deviceChangeHandler={mockDeviceChangeHandler}
      />
    );

    expect(
      screen.queryByTestId(`${kind}-menu-item-${firstDevice.deviceId}`)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId(`${kind}-menu-item-${secondDevice.deviceId}`)
    ).not.toBeInTheDocument();
  });

  it('only renders devices of the specified kind', () => {
    vi.spyOn(util, 'isGetActiveAudioOutputDeviceSupported').mockReturnValue(true);

    testDeviceKindRendering('audioinput');
    testDeviceKindRendering('audiooutput');
    testDeviceKindRendering('videoinput');
  });
});

function testDeviceKindRendering(kind: MediaDeviceKind) {
  const mockOnClose = vi.fn();
  const mockDeviceChangeHandler = vi.fn();
  const anchorEl = document.createElement('div');
  const devicesOfKind = someDevices.filter((d) => d.kind === kind);
  const firstDevice = devicesOfKind[0];

  const { unmount } = render(
    <MenuDevices
      mediaDeviceKind={kind}
      onClose={mockOnClose}
      open
      anchorEl={anchorEl}
      localSource={firstDevice.deviceId}
      deviceChangeHandler={mockDeviceChangeHandler}
    />
  );

  devicesOfKind.forEach((device) => {
    const element = screen.getByTestId(`${kind}-menu-item-${device.deviceId}`);
    expect(element).toBeInTheDocument();

    const shouldBeSelected = device.deviceId === firstDevice.deviceId;

    if (shouldBeSelected) {
      expect(element).toHaveClass('Mui-selected');
    }

    if (!shouldBeSelected) {
      expect(element).not.toHaveClass('Mui-selected');
    }
  });

  someDevices
    .filter((d) => d.kind !== kind)
    .forEach((device) => {
      expect(
        screen.queryByTestId(`${device.kind}-menu-item-${device.deviceId}`)
      ).not.toBeInTheDocument();
    });

  unmount();
}
