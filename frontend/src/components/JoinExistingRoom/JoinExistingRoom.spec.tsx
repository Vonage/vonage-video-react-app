import { render as renderBase, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { makeTestProvider, providers } from '@test/providers';
import JoinExistingRoom from './index';
import { testIds as roomNameInputTestIds } from '../RoomNameInput/RoomNameInput';

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useNavigate: vi.fn(),
  };
});

describe('JoinExistingRoom', () => {
  it('should display the correct JoinExistingRoom', () => {
    const { wrapper } = makeTestProvider([providers.runtime]);
    renderBase(<JoinExistingRoom />, { wrapper });

    expect(screen.getByTestId('JoinExistingRoom')).toBeInTheDocument();
    expect(screen.getByText('Join waiting room')).toBeInTheDocument();
    expect(screen.getByTestId(roomNameInputTestIds.input)).toHaveAccessibleName('Room ID');
  });
});
