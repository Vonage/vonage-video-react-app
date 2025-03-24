import { beforeEach, describe, expect, it, vi, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MutableRefObject } from 'react';
import { EventEmitter } from 'stream';
import VideoOutputDevices from './VideoOutputDevices';
import {
  audioInputDevices,
  audioOutputDevices,
  nativeDevices,
  videoInputDevices,
} from '../../../utils/mockData/device';

vi.mock('../../../hooks/useSessionContext');
vi.mock('../../../hooks/useUserContext');
vi.mock('../../../hooks/useRoomName');
const mockHandleToggle = vi.fn();
const mockHandleClose = vi.fn();
const mockAnchorRef = {
  current: document.createElement('input'),
} as MutableRefObject<HTMLInputElement>;

const { mockHasMediaProcessorSupport, mockGetDevices, mockGetAudioOutputDevices } = vi.hoisted(
  () => {
    return {
      mockGetDevices: vi.fn(),
      mockGetAudioOutputDevices: vi.fn(),
      mockHasMediaProcessorSupport: vi.fn().mockReturnValue(true),
    };
  }
);
vi.mock('@vonage/client-sdk-video', () => ({
  getAudioOutputDevices: mockGetAudioOutputDevices,
  getDevices: mockGetDevices,
  hasMediaProcessorSupport: mockHasMediaProcessorSupport,
}));

describe('VideoOutputDevices', () => {
  const nativeMediaDevices = global.navigator.mediaDevices;
  let deviceChangeListener: EventEmitter;
  beforeEach(() => {
    vi.resetAllMocks();
    mockGetAudioOutputDevices.mockResolvedValue(audioOutputDevices);
    mockGetDevices.mockImplementation((cb) =>
      cb(null, [...audioInputDevices, ...videoInputDevices])
    );
    deviceChangeListener = new EventEmitter();
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: {
        enumerateDevices: vi.fn(
          () =>
            new Promise<MediaDeviceInfo[]>((res) => {
              res(nativeDevices as MediaDeviceInfo[]);
            })
        ),
        addEventListener: vi.fn((event, listener) => deviceChangeListener.on(event, listener)),
        removeEventListener: vi.fn((event, listener) => deviceChangeListener.off(event, listener)),
      },
    });
  });

  afterAll(() => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      writable: true,
      value: nativeMediaDevices,
    });
  });

  it('renders if opened', () => {
    render(
      <VideoOutputDevices
        handleToggle={mockHandleToggle}
        handleClose={mockHandleClose}
        isOpen
        anchorRef={mockAnchorRef}
      />
    );
    expect(screen.queryByTestId('video-output-devices-dropdown')).toBeInTheDocument();
  });

  it('does not render if closed', () => {
    render(
      <VideoOutputDevices
        handleToggle={mockHandleToggle}
        handleClose={mockHandleClose}
        isOpen={false}
        anchorRef={mockAnchorRef}
      />
    );
    expect(screen.queryByTestId('video-output-devices-dropdown')).not.toBeInTheDocument();
  });
});
