import { testIds } from './JoinExistingRoom';
import { testIds as joinWaitRoomButtonTestIds } from '../JoinWaitRoomButton/JoinWaitRoomButton';
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

    expect(screen.getByTestId(testIds.container)).toBeInTheDocument();
    expect(screen.getByTestId(joinWaitRoomButtonTestIds.button)).toHaveAccessibleName(
      'Join waiting room'
    );
    expect(screen.getByTestId(roomNameInputTestIds.input)).toHaveAccessibleName('Room ID');
  });
});
