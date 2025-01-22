import { render, screen } from '@testing-library/react';
import { describe, beforeEach, it, Mock, vi, expect, afterAll } from 'vitest';
import { MutableRefObject } from 'react';
import * as util from '../../../utils/util';
import AudioInputOutputDevices from './AudioInputOutputDevices';
import { AudioOutputProvider } from '../../../Context/AudioOutputProvider';
import {
  audioInputDevices,
  audioOutputDevices,
  nativeDevices,
  videoInputDevices,
} from '../../../utils/mockData/device';

const {
  mockHasMediaProcessorSupport,
  mockGetDevices,
  mockGetAudioOutputDevices,
  mockSetAudioOutputDevice,
  mockGetActiveAudioOutputDevice,
} = vi.hoisted(() => {
  return {
    mockGetDevices: vi.fn(),
    mockGetAudioOutputDevices: vi.fn(),
    mockSetAudioOutputDevice: vi.fn(),
    mockHasMediaProcessorSupport: vi.fn().mockReturnValue(true),
    mockGetActiveAudioOutputDevice: vi.fn().mockResolvedValue({ deviceId: null, label: null }),
  };
});
vi.mock('@vonage/client-sdk-video', () => ({
  getActiveAudioOutputDevice: mockGetActiveAudioOutputDevice,
  getAudioOutputDevices: mockGetAudioOutputDevices,
  getDevices: mockGetDevices,
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
  setAudioOutputDevice: mockSetAudioOutputDevice,
}));

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

    mockGetDevices.mockImplementation((cb) => cb([...audioInputDevices, ...videoInputDevices]));
    mockGetAudioOutputDevices.mockResolvedValue(audioOutputDevices);
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn(
          () =>
            new Promise<MediaDeviceInfo[]>((res) => {
              res(nativeDevices as MediaDeviceInfo[]);
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
    expect(outputDevicesElement).toHaveTextContent('System Default');
    expect(outputDevicesElement).toHaveTextContent('MacBook Pro Speakers (Built-in)');
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
    expect(outputDevicesElement).toHaveTextContent('System Default');
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
