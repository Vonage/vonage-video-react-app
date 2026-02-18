import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import MemoryRouter from '@test/RouterWrapper';
import ReenterRoomButton from './index';

describe('ReenterRoomButton', () => {
  it('should display the correct reenter room button', async () => {
    render(
      <MemoryRouter>
        <ReenterRoomButton roomName="room1" />
      </MemoryRouter>
    );

    const button = screen.getByTestId('reenterButton');
    await userEvent.click(button);

    expect(screen.getByText('Go back to meeting')).toBeInTheDocument();
  });

  it('should not display the reenter room button', () => {
    render(
      <MemoryRouter>
        <ReenterRoomButton roomName="" />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('reenterButton')).not.toBeInTheDocument();
    expect(screen.queryByText('Go back to meeting')).not.toBeInTheDocument();
  });
});
