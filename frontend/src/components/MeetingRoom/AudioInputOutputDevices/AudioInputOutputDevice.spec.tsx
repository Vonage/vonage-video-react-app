import { render, screen } from '@testing-library/react';
import { describe, beforeEach, it, Mock, vi, expect, afterAll } from 'vitest';
import { MutableRefObject } from 'react';
import * as util from '../../../utils/util';
import AudioInputOutputDevices from './AudioInputOutputDevices';
import { AudioOutputProvider } from '../../../Context/AudioOutputProvider';

vi.mock('../../../utils/util', async () => {
  const actual = await vi.importActual<typeof import('../../../utils/util')>('../../../utils/util');
  return {
    ...actual,
    isGetActiveAudioOutputDeviceSupported: vi.fn(),
  };
});

describe('AudioInputOutputDevice Component', () => {
  const nativeMediaDevices = global.navigator.mediaDevices;
  const mockHandleToggle = vi.fn();
  const mockAnchorRef = {
    current: document.createElement('input'),
  } as MutableRefObject<HTMLInputElement>;
  const mockHandleClose = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn(
          () =>
            new Promise<MediaDeviceInfo[]>((res) => {
              res([]);
            })
        ),
        addEventListener: vi.fn(() => []),
        removeEventListener: vi.fn(() => []),
      },
    });
  });

  afterAll(() => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: nativeMediaDevices,
    });
  });

  it('renders the output devices if the browser supports it', () => {
    (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(true);

    render(
      <AudioOutputProvider>
        <AudioInputOutputDevices
          handleToggle={mockHandleToggle}
          isOpen
          anchorRef={mockAnchorRef}
          handleClose={mockHandleClose}
        />
      </AudioOutputProvider>
    );

    const outputDevicesElement = screen.getByTestId('output-devices');
    expect(outputDevicesElement).toBeInTheDocument();
  });

  it('does not render the output devices if the browser does not support it', () => {
    (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(false);

    render(
      <AudioOutputProvider>
        <AudioInputOutputDevices
          handleToggle={mockHandleToggle}
          isOpen
          anchorRef={mockAnchorRef}
          handleClose={mockHandleClose}
        />
      </AudioOutputProvider>
    );

    const outputDevicesElement = screen.queryByTestId('output-devices');
    expect(outputDevicesElement).not.toBeInTheDocument();
  });

  it('renders the speaker test if the browser supports audio output device selection', () => {
    (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(true);

    render(
      <AudioOutputProvider>
        <AudioInputOutputDevices
          handleToggle={mockHandleToggle}
          isOpen
          anchorRef={mockAnchorRef}
          handleClose={mockHandleClose}
        />
      </AudioOutputProvider>
    );

    const outputDevicesElement = screen.getByTestId('output-devices');
    expect(outputDevicesElement).toBeInTheDocument();
  });

  it('does not render the speaker test devices if the browser does not support audio output device selection', () => {
    (util.isGetActiveAudioOutputDeviceSupported as Mock).mockReturnValue(false);

    render(
      <AudioOutputProvider>
        <AudioInputOutputDevices
          handleToggle={mockHandleToggle}
          isOpen
          anchorRef={mockAnchorRef}
          handleClose={mockHandleClose}
        />
      </AudioOutputProvider>
    );

    const soundTest = screen.queryByTestId('soundTest');
    expect(soundTest).not.toBeInTheDocument();
  });
});
