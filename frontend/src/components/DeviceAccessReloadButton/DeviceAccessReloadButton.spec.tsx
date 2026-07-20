import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import DeviceAccessReloadButton from './DeviceAccessReloadButton';
import reloadPage from '@utils/reloadPage';

vi.mock('@utils/reloadPage', () => ({ default: vi.fn() }));

describe('DeviceAccessReloadButton', () => {
  it('renders the reload label', () => {
    render(<DeviceAccessReloadButton />);

    expect(screen.getByTestId('device-access-reload-button')).toHaveTextContent('Reload page');
  });

  it('reloads the page when clicked', async () => {
    const user = userEvent.setup();
    render(<DeviceAccessReloadButton />);

    await user.click(screen.getByTestId('device-access-reload-button'));

    expect(vi.mocked(reloadPage)).toHaveBeenCalledTimes(1);
  });

  it('still calls a caller-supplied onClick before reloading', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DeviceAccessReloadButton onClick={onClick} />);

    await user.click(screen.getByTestId('device-access-reload-button'));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(vi.mocked(reloadPage)).toHaveBeenCalled();
  });
});
