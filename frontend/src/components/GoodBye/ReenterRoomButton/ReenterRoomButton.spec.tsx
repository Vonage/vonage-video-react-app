import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import MemoryRouter from '@test/RouterWrapper';
import ReenterRoomButton from './index';
import { AnyFunction } from '@common/types';

const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => mockUseParams() as AnyFunction,
  };
});

describe('ReenterRoomButton', () => {
  it('should display the correct reenter room button', async () => {
    mockUseParams.mockReturnValue({ roomIdentifier: 'test-room' });

    render(
      <MemoryRouter>
        <ReenterRoomButton />
      </MemoryRouter>
    );

    const button = screen.getByTestId('reenterButton');
    await userEvent.click(button);

    expect(screen.getByText('Go back to meeting')).toBeInTheDocument();
  });

  it('should not display the reenter room button', () => {
    mockUseParams.mockReturnValue({});

    render(
      <MemoryRouter>
        <ReenterRoomButton />
      </MemoryRouter>
    );

    expect(screen.queryByTestId('reenterButton')).not.toBeInTheDocument();
    expect(screen.queryByText('Go back to meeting')).not.toBeInTheDocument();
  });
});
