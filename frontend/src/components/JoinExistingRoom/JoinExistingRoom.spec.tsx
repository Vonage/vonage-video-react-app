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

    expect(screen.getByTestId('JoinExistingRoom')).toBeInTheDocument();
    expect(screen.getByText('Join waiting room')).toBeInTheDocument();
    expect(screen.getAllByText(/Room name/i)[0]).toBeInTheDocument();
  });
});
