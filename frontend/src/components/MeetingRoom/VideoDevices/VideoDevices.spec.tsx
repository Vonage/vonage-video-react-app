import { describe, it, beforeEach, vi, expect } from 'vitest';
import { render as renderBase, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReactElement } from 'react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import { makeMediaDeviceInfos, setupWindowNavigatorMock } from '@web-test/fixtures';
import VideoDevices from './VideoDevices';
import type { AnyFunction } from 'react-global-state-hooks';
import mediaDevices$ from '@core/stores/devices/devices$';

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

  beforeEach(() => {
    // Setup other navigator.mediaDevices mocks
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(someDevices),
        getUserMedia: getUserMediaMock,
      },
    });

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

    render(<VideoDevices handleToggle={mockHandleToggle} />);

    // Get the second video device from the fixture
    const videoDevices = someDevices.filter((d) => d.kind === 'videoinput');
    const secondDevice = videoDevices[1];

    const cameraItem = screen.getByText(secondDevice.label);
    fireEvent.click(cameraItem);

    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(selectDeviceSpy).toHaveBeenCalledWith('videoinput', secondDevice.deviceId);
    // Note: publisher.setVideoSource is now called by useSyncPublisherDevices hook,
    // not by the VideoDevices component directly

    await waitForDeviceSelectionReconciliation(secondDevice.deviceId);
  });

  it('handles setVideoSource when publisher is not initialized', async () => {
    const selectDeviceSpy = vi.spyOn(mediaDevices$.actions, 'selectDevice');

    render(<VideoDevices handleToggle={mockHandleToggle} />);

    // Get the second video device from the fixture
    const videoDevices = someDevices.filter((d) => d.kind === 'videoinput');
    const secondDevice = videoDevices[1];

    const cameraItem = screen.getByText(secondDevice.label);
    fireEvent.click(cameraItem);

    // Should still select device in store even if publisher is not initialized
    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
    expect(selectDeviceSpy).toHaveBeenCalledWith('videoinput', secondDevice.deviceId);

    await waitForDeviceSelectionReconciliation(secondDevice.deviceId);
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  sessionContext?: ProviderOptions['SessionContext'];
  publisherContext?: ProviderOptions['PublisherContext'];
};

function render(
  ui: ReactElement,
  { userContext, sessionContext, publisherContext }: RenderOptions = {}
) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.publisher, providers.runtime],
    {
      userContext,
      sessionContext,
      publisherContext,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}

async function waitForDeviceSelectionReconciliation(deviceId: string) {
  await waitFor(() => {
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: { deviceId: { exact: deviceId } },
      audio: false,
    });
  });

  await waitFor(() => {
    expect(mediaDevices$.getState().videoinput).toBe(deviceId);
  });
}
