import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import JoinExistingRoom from './index';

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

describe('JoinExistingRoom', () => {
  it('should display the correct JoinExistingRoom', async () => {
    render(<JoinExistingRoom />);

    // Check room is correctly displayed
    expect(screen.getByTestId('JoinExistingRoom')).toBeInTheDocument();
    expect(screen.getByTestId('KeyboardIcon')).toBeInTheDocument();
    expect(screen.getByText('Join')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter room name/i)).toBeInTheDocument();
  });
});
