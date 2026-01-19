import { describe, it, beforeEach, vi, expect } from 'vitest';
import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import {
  type PublisherProviderWrapperOptions,
  makePublisherProviderWrapper,
} from '@test/providers';
import makeMediaDeviceInfos from '@common-test/fixtures/makeMediaDeviceInfos';
import VideoDevices from './VideoDevices';
import type { AnyFunction } from 'react-global-state-hooks';

const someDevices = makeMediaDeviceInfos();

// Mock Vonage SDK's initPublisher
vi.mock('@vonage/client-sdk-video', async () => {
  const actual = await vi.importActual('@vonage/client-sdk-video');
  return {
    ...actual,
    initPublisher: vi.fn(() => {
      const listeners: Record<string, AnyFunction[]> = {};
      const mockPublisher = {
        on: vi.fn((event: string, callback: AnyFunction) => {
          if (!listeners[event]) listeners[event] = [];
          listeners[event].push(callback);

          // If accessAllowed listener is added, call it immediately
          if (event === 'accessAllowed') {
            setTimeout(() => void callback(), 0);
          }
        }),
        off: vi.fn(),
        once: vi.fn(),
        setVideoSource: vi.fn(),
        getVideoSource: vi.fn(() => ({
          deviceId: 'a68ec4e4a6bc10dc572bd806414b0da27d0aefb0ad822f7ba4cf9b226bb9b7c2',
          label: 'FaceTime HD Camera (2C0E:82E3)',
        })),
      };

      return mockPublisher;
    }),
  };
});

// Setup getUserMedia mock at module level to persist through async operations
const getUserMediaMock = vi.fn(() =>
  Promise.resolve({
    getVideoTracks: () => [],
    getAudioTracks: () => [],
    getTracks: () => [],
  } as unknown as MediaStream)
);

describe('VideoDevices Component', () => {
  const mockHandleToggle = vi.fn();

  let mediaDevices$: typeof import('@core/stores/devices').default;

  beforeEach(async () => {
    // Setup other navigator.mediaDevices mocks
    const { mediaDevices } = globalThis.navigator;
    vi.spyOn(mediaDevices, 'addEventListener').mockImplementation(vi.fn());
    vi.spyOn(mediaDevices, 'removeEventListener').mockImplementation(vi.fn());
    vi.spyOn(mediaDevices, 'enumerateDevices').mockResolvedValue(someDevices);
    vi.spyOn(mediaDevices, 'getUserMedia').mockImplementation(getUserMediaMock);

    // Import and setup mediaDevices$ store
    mediaDevices$ = (await import('@core/stores/devices')).default;
    mediaDevices$.setState((state) => ({
      ...state,
      mediaDeviceInfo: someDevices,
    }));
  });

  it('renders all available video devices', () => {
    render(<VideoDevices handleToggle={mockHandleToggle} />);

    expect(screen.getByText('Camera')).toBeInTheDocument();

    // Get video input devices from the fixture
    const videoDevices = someDevices.filter((d) => d.kind === 'videoinput');
    videoDevices.forEach((device) => {
      expect(screen.getByText(device.label)).toBeInTheDocument();
    });
  });

  it('changes video source on menu item click', async () => {
    const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

    const { publisherContext } = render(<VideoDevices handleToggle={mockHandleToggle} />);

    publisherContext.current.initializeLocalPublisher({});

    // Wait for publisher to be initialized (accessAllowed event)
    await waitFor(() => {
      expect(publisherContext.current.publisher).toBeDefined();
    });

    const setVideoSourceSpy = vi.spyOn(publisherContext.current.publisher!, 'setVideoSource');

    // Get the second video device from the fixture
    const videoDevices = someDevices.filter((d) => d.kind === 'videoinput');
    const secondDevice = videoDevices[1];

    const cameraItem = screen.getByText(secondDevice.label);
    fireEvent.click(cameraItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(selectDeviceSpy).toHaveBeenCalledWith('videoinput', secondDevice.deviceId);
    expect(setVideoSourceSpy).toHaveBeenCalledWith(secondDevice.deviceId);
  });

  it('does not call setVideoSource if selected device is not found', async () => {
    const { publisherContext } = render(<VideoDevices handleToggle={mockHandleToggle} />);

    publisherContext.current.initializeLocalPublisher({});

    await waitFor(() => {
      expect(publisherContext.current.publisher).toBeDefined();
    });

    const setVideoSourceSpy = vi.spyOn(publisherContext.current.publisher!, 'setVideoSource');

    const bogusItem = document.createElement('li');
    bogusItem.textContent = 'Nonexistent Camera';
    fireEvent.click(bogusItem); // simulate bogus click

    expect(setVideoSourceSpy).not.toHaveBeenCalled();
  });

  it('is not rendered when allowDeviceSelection is false', () => {
    const { container } = render(<VideoDevices handleToggle={mockHandleToggle} />, {
      appConfigOptions: {
        value: {
          meetingRoomSettings: {
            allowDeviceSelection: false,
          },
        },
      },
    });

    expect(container.firstChild).toBeNull();
  });

  it('is not rendered when allowDeviceSelection is false', () => {
    const { container } = render(<VideoDevices handleToggle={mockHandleToggle} />, {
      appConfigOptions: {
        value: {
          meetingRoomSettings: {
            allowDeviceSelection: false,
          },
        },
      },
    });

    expect(container.firstChild).toBeNull();
  });
});

function render(ui: ReactElement, publisherOptions: PublisherProviderWrapperOptions = {}) {
  const { PublisherProviderWrapper, ...publisherContext } =
    makePublisherProviderWrapper(publisherOptions);

  return {
    ...publisherContext,
    ...renderBase(ui, { wrapper: PublisherProviderWrapper }),
  };
}
