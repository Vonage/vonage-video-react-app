import { render as renderBase, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import DeviceAccessHint from './DeviceAccessHint';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import composeProviders from '@web/helpers/composeProviders';
import { setupWindowNavigatorMock, makeMediaDeviceInfos } from '@web-test/fixtures';

const mockDevices = makeMediaDeviceInfos();

describe('DeviceAccessHint', () => {
  beforeEach(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        addEventListener: vi.fn(),
        enumerateDevices: Promise.resolve(mockDevices),
      },
    });

    const { permissions } = globalThis.navigator;
    vi.spyOn(permissions, 'query').mockResolvedValue({ state: 'granted' } as PermissionStatus);
  });

  it('names both devices when the camera and microphone are blocked', async () => {
    render(<DeviceAccessHint />, {
      previewPublisherContext: {
        __interceptor: (context) => {
          context.deniedDevices = { microphone: true, camera: true };
        },
      },
    });

    await waitFor(() => {
      const hint = screen.getByTestId('device-access-hint');
      expect(hint).toHaveTextContent('Camera and microphone access is blocked');
      expect(hint).toHaveAttribute('role', 'alert');
    });
  });

  it('names only the microphone when only the microphone is blocked', async () => {
    render(<DeviceAccessHint />, {
      previewPublisherContext: {
        __interceptor: (context) => {
          context.deniedDevices = { microphone: true, camera: false };
        },
      },
    });

    await waitFor(() => {
      const hint = screen.getByTestId('device-access-hint');
      expect(hint).toHaveTextContent('Microphone');
    });
  });

  it('renders nothing when no device is blocked', async () => {
    render(<DeviceAccessHint />);

    // Give the preview provider a tick to settle; the hint must stay absent.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByTestId('device-access-hint')).not.toBeInTheDocument();
  });
});

type RenderOptions = {
  userContext?: ProviderOptions['UserContext'];
  previewPublisherContext?: ProviderOptions['PreviewPublisherContext'];
};

function render(ui: ReactElement, { userContext, previewPublisherContext }: RenderOptions = {}) {
  const { wrapper: MainWrapper, ...context } = makeTestProvider(
    [providers.user, providers.previewPublisher],
    {
      userContext,
      previewPublisherContext,
    }
  );

  const wrapper = composeProviders(SuspenseBoundary, MainWrapper);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
