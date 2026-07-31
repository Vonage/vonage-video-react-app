import { render as renderBase, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { makeTestProvider, ProviderOptions, providers } from '@test/providers';
import DeviceAccessHint from './DeviceAccessHint';
import SuspenseBoundary from '@web/components/SuspenseBoundary/SuspenseBoundary';
import composeProviders from '@web/helpers/composeProviders';
import { setupWindowNavigatorMock, makeMediaDeviceInfos } from '@web-test/fixtures';
import shouldOfferReloadRecovery from '@utils/publisher/shouldOfferReloadRecovery';

vi.mock('@utils/publisher/shouldOfferReloadRecovery', () => ({ default: vi.fn() }));

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

    // Default to a browser where reload is the recovery (Safari/Firefox); Chrome is covered explicitly.
    vi.mocked(shouldOfferReloadRecovery).mockReturnValue(true);
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

  it('offers a reload affordance while a device is blocked on Safari/Firefox', async () => {
    vi.mocked(shouldOfferReloadRecovery).mockReturnValue(true);

    render(<DeviceAccessHint />, {
      previewPublisherContext: {
        __interceptor: (context) => {
          context.deniedDevices = { microphone: true, camera: true };
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('device-access-reload-button')).toBeVisible();
    });
  });

  it('does NOT offer a reload affordance on Chromium (click-to-reprompt recovers live)', async () => {
    vi.mocked(shouldOfferReloadRecovery).mockReturnValue(false);

    render(<DeviceAccessHint />, {
      previewPublisherContext: {
        __interceptor: (context) => {
          context.deniedDevices = { microphone: true, camera: true };
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('device-access-hint')).toHaveTextContent(
        'Camera and microphone access is blocked'
      );
    });
    expect(screen.queryByTestId('device-access-reload-button')).not.toBeInTheDocument();
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
