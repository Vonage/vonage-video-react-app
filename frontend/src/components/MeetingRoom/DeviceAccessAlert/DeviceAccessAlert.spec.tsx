import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { PublisherContextType } from '@Context/PublisherProvider';
import usePublisherContext from '@hooks/usePublisherContext';
import shouldOfferReloadRecovery from '@utils/publisher/shouldOfferReloadRecovery';
import DeviceAccessAlert from './DeviceAccessAlert';

vi.mock('@hooks/usePublisherContext');
vi.mock('@utils/reloadPage', () => ({ default: vi.fn() }));
vi.mock('@utils/publisher/shouldOfferReloadRecovery', () => ({ default: vi.fn() }));

type Denied = { microphone: boolean; camera: boolean } | undefined;

function setDeniedDevices(deniedDevices: Denied) {
  vi.mocked(usePublisherContext).mockReturnValue({
    deniedDevices,
  } as unknown as PublisherContextType);
}

describe('DeviceAccessAlert', () => {
  beforeEach(() => {
    setDeniedDevices({ microphone: false, camera: false });
    // Default to a browser where reload is the recovery (Safari/Firefox); Chrome is covered explicitly.
    vi.mocked(shouldOfferReloadRecovery).mockReturnValue(true);
  });

  it('shows the blocked alert with a reload affordance when a device is blocked on Safari/Firefox', () => {
    vi.mocked(shouldOfferReloadRecovery).mockReturnValue(true);
    setDeniedDevices({ microphone: false, camera: true });
    render(<DeviceAccessAlert />);

    expect(screen.getByRole('alert')).toHaveTextContent('Device access blocked');
    expect(screen.getByTestId('device-access-reload-button')).toBeVisible();
  });

  it('shows the blocked alert WITHOUT a reload affordance on Chromium', () => {
    vi.mocked(shouldOfferReloadRecovery).mockReturnValue(false);
    setDeniedDevices({ microphone: false, camera: true });
    render(<DeviceAccessAlert />);

    expect(screen.getByRole('alert')).toHaveTextContent('Device access blocked');
    expect(screen.queryByTestId('device-access-reload-button')).not.toBeInTheDocument();
  });

  it('renders nothing when no device is blocked', () => {
    setDeniedDevices({ microphone: false, camera: false });
    const { container } = render(<DeviceAccessAlert />);

    expect(screen.queryByTestId('device-access-reload-button')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  it('tolerates an absent deniedDevices from a partial publisher context', () => {
    setDeniedDevices(undefined);
    const { container } = render(<DeviceAccessAlert />);

    expect(container).toBeEmptyDOMElement();
  });
});
