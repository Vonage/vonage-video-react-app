import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';
import DeviceAccessAlert from './DeviceAccessAlert';
import * as util from '../../utils/util';
import { DEVICE_ACCESS_STATUS } from '../../utils/constants';

vi.mock('../../utils/util', async () => {
  const actual = await vi.importActual<typeof import('../../utils/util')>('../../utils/util');
  return {
    ...actual,
    isWebKit: vi.fn(),
  };
});

describe('DeviceAccessAlert', () => {
  it('should display the correct message and image when access status is PENDING', () => {
    (util.isWebKit as Mock).mockReturnValue(false);
    render(<DeviceAccessAlert accessStatus={DEVICE_ACCESS_STATUS.PENDING} />);

    // Check that the correct message is displayed
    expect(
      screen.getByText(
        'To join the video room, your browser will request access to your camera and microphone.'
      )
    ).toBeInTheDocument();

    // Check that the correct image is displayed
    const imgElement = screen.getByAltText('Access Dialog');
    expect(imgElement).toHaveAttribute('src', '/images/access-dialog-pending.png');
  });

  it('should display the correct message and image when access status is DENIED', () => {
    (util.isWebKit as Mock).mockReturnValue(false);
    render(<DeviceAccessAlert accessStatus={DEVICE_ACCESS_STATUS.REJECTED} />);

    // Check that the correct message is displayed
    expect(
      screen.getByText(
        "It seems your browser is blocked from accessing your camera and/or microphone. Reset the permission state through your browser's UI."
      )
    ).toBeInTheDocument();

    // Check that the correct image is displayed
    const imgElement = screen.getByAltText('Access Dialog');
    expect(imgElement).toHaveAttribute('src', '/images/access-dialog-rejected.png');
  });

  it('should not display anything when access status is set to null', () => {
    (util.isWebKit as Mock).mockReturnValue(false);
    render(<DeviceAccessAlert accessStatus={null} />);

    // Check that there is no alert displayed
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should not display anything when the user is using Safari', () => {
    (util.isWebKit as Mock).mockReturnValue(true);
    render(<DeviceAccessAlert accessStatus={DEVICE_ACCESS_STATUS.PENDING} />);

    // Check that there is no alert displayed
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
