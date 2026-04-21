import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, it, vi, expect, beforeEach, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { makeMediaDeviceInfos, setupWindowNavigatorMock } from '@web-test/fixtures';

import MenuDevices from './MenuDevices';
import * as util from '@utils/util';
import mediaDevices$ from '@core/stores/devices';

const someDevices = makeMediaDeviceInfos();

const devicesWithDefaultOutput = [
  ...someDevices.filter((d) => d.kind !== 'audiooutput'),
  {
    deviceId: 'default',
    kind: 'audiooutput' as MediaDeviceKind,
    label: 'Default',
    groupId: 'group-3',
    toJSON: () => ({
      deviceId: 'default',
      kind: 'audiooutput' as MediaDeviceKind,
      label: 'Default',
      groupId: 'group-3',
    }),
  },
  ...someDevices.filter((d) => d.kind === 'audiooutput'),
] as MediaDeviceInfo[];

describe('MenuDevices Component', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn().mockReturnValue(true),
        enumerateDevices: Promise.resolve(someDevices),
        removeEventListener: vi.fn(),
      },
      permissions: {
        query: Promise.resolve({
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          state: 'granted',
        } as unknown as PermissionStatus),
      },
    });

    mediaDevices$.reset();
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: someDevices,
    }));
  });

  afterEach(() => {
    act(() => {
      mediaDevices$.reset();
      mediaDevices$.setState((state) => ({
        ...state,
        mediaDeviceInfo: someDevices,
      }));
    });
  });

  it('calls deviceChangeHandler and onClose when device is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    const mockDeviceChangeHandler = vi.fn();
    const anchorEl = document.createElement('div');

    const kind = 'audioinput';
    const audioInputDevices = someDevices.filter((d) => d.kind === kind);
    const secondDevice = audioInputDevices[1];

    render(
      <MenuDevices
        mediaDeviceKind={kind}
        onClose={mockOnClose}
        open
        anchorEl={anchorEl}
        deviceChangeHandler={mockDeviceChangeHandler}
      />
    );

    await user.click(screen.getByTestId(`${kind}-menu-item-${secondDevice.deviceId}`));

    expect(mockDeviceChangeHandler).toHaveBeenCalledWith(secondDevice.deviceId);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not render audio output devices when browser does not support it', async () => {
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
        deviceChangeHandler={mockDeviceChangeHandler}
      />
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId(`${kind}-menu-item-${firstDevice.deviceId}`)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId(`${kind}-menu-item-${secondDevice.deviceId}`)
      ).not.toBeInTheDocument();
    });
  });

  it('only renders devices of the specified kind', () => {
    vi.spyOn(util, 'isGetActiveAudioOutputDeviceSupported').mockReturnValue(true);

    testDeviceKindRendering('audioinput');
    testDeviceKindRendering('audiooutput');
    testDeviceKindRendering('videoinput');
  });

  it('renders SoundTest when audiooutput devices are available', async () => {
    vi.spyOn(util, 'isGetActiveAudioOutputDeviceSupported').mockReturnValue(true);

    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

    const anchorEl = document.createElement('div');

    render(
      <MenuDevices
        mediaDeviceKind="audiooutput"
        onClose={vi.fn()}
        open
        anchorEl={anchorEl}
        deviceChangeHandler={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('soundTest')).toBeInTheDocument();
    });
  });

  it('does not render SoundTest when no audiooutput devices are available', async () => {
    vi.spyOn(util, 'isGetActiveAudioOutputDeviceSupported').mockReturnValue(true);

    act(() => {
      mediaDevices$.setState((state) => ({
        ...state,
        mediaDeviceInfo: someDevices.filter((d) => d.kind !== 'audiooutput'),
        audiooutput: undefined,
      }));
    });

    const anchorEl = document.createElement('div');

    render(
      <MenuDevices
        mediaDeviceKind="audiooutput"
        onClose={vi.fn()}
        open
        anchorEl={anchorEl}
        deviceChangeHandler={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.queryByTestId('soundTest')).not.toBeInTheDocument();
    });
  });

  it('merges system default audio output device into matching physical device', async () => {
    vi.spyOn(util, 'isGetActiveAudioOutputDeviceSupported').mockReturnValue(true);

    act(() => {
      mediaDevices$.setState((state) => ({
        ...state,
        mediaDeviceInfo: devicesWithDefaultOutput,
      }));
    });

    const anchorEl = document.createElement('div');
    render(
      <MenuDevices
        mediaDeviceKind="audiooutput"
        onClose={vi.fn()}
        open
        anchorEl={anchorEl}
        deviceChangeHandler={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(screen.queryByTestId('audiooutput-menu-item-default')).not.toBeInTheDocument();
      expect(screen.getByText('Default Speakers - System Default')).toBeInTheDocument();
    });
  });

  it('shows merged system default device as selected when localSource is default', async () => {
    vi.spyOn(util, 'isGetActiveAudioOutputDeviceSupported').mockReturnValue(true);

    act(() => {
      mediaDevices$.setState((state) => ({
        ...state,
        mediaDeviceInfo: devicesWithDefaultOutput,
        audiooutput: 'default',
      }));
    });

    const anchorEl = document.createElement('div');
    render(
      <MenuDevices
        mediaDeviceKind="audiooutput"
        onClose={vi.fn()}
        open
        anchorEl={anchorEl}
        deviceChangeHandler={vi.fn()}
      />
    );

    await waitFor(() => {
      const item = screen.getByTestId('audiooutput-menu-item-audio-output-1');
      expect(item).toHaveClass('Mui-selected');
    });
  });

  it('calls deviceChangeHandler with "default" when annotated system default device is clicked', async () => {
    vi.spyOn(util, 'isGetActiveAudioOutputDeviceSupported').mockReturnValue(true);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);

    const mockDeviceChangeHandler = vi.fn();

    act(() => {
      mediaDevices$.setState((state) => ({
        ...state,
        mediaDeviceInfo: devicesWithDefaultOutput,
      }));
    });

    const anchorEl = document.createElement('div');
    render(
      <MenuDevices
        mediaDeviceKind="audiooutput"
        onClose={vi.fn()}
        open
        anchorEl={anchorEl}
        deviceChangeHandler={mockDeviceChangeHandler}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('audiooutput-menu-item-audio-output-1')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('audiooutput-menu-item-audio-output-1'));

    expect(mockDeviceChangeHandler).toHaveBeenCalledWith('default');
  });

  it('renders an empty state when no devices are available', async () => {
    const mockOnClose = vi.fn();
    const mockDeviceChangeHandler = vi.fn();
    const anchorEl = document.createElement('div');

    act(() => {
      mediaDevices$.setState((state) => ({
        ...state,
        mediaDeviceInfo: [],
        audioinput: undefined,
      }));
    });

    render(
      <MenuDevices
        mediaDeviceKind="audioinput"
        onClose={mockOnClose}
        open
        anchorEl={anchorEl}
        deviceChangeHandler={mockDeviceChangeHandler}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('audioinput-menu-empty-state')).toBeInTheDocument();
      expect(screen.getByText('No devices found')).toBeInTheDocument();
    });
  });
});

function testDeviceKindRendering(kind: MediaDeviceKind) {
  const mockOnClose = vi.fn();
  const mockDeviceChangeHandler = vi.fn();
  const anchorEl = document.createElement('div');
  const devicesOfKind = someDevices.filter((d) => d.kind === kind);
  const firstDevice = devicesOfKind[0];

  // Set the first device as selected in the store for this kind
  act(() => {
    mediaDevices$.setState((state) => ({
      ...state,
      [kind]: firstDevice.deviceId,
    }));
  });

  const { unmount } = render(
    <MenuDevices
      mediaDeviceKind={kind}
      onClose={mockOnClose}
      open
      anchorEl={anchorEl}
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
