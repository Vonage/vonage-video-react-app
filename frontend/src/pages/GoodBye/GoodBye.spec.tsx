import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GoodBye from './GoodBye';
import useArchives from '../../hooks/useArchives';
import { availableArchive, failedArchive, pendingArchive } from '../../api/archiving/tests/data';

vi.mock('../../hooks/useArchives');
const mockUseArchives = useArchives as Mock<[], ReturnType<typeof useArchives>>;

vi.mock('react-router-dom', async () => {
  const mod = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...mod,
    useLocation: () => ({}),
  };
});

describe('GoodBye', () => {
  beforeEach(() => {
    mockUseArchives.mockReturnValue([]);
  });

  it('should render', () => {
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );

    expect(screen.getByText('You left the room')).toBeVisible();
    expect(screen.getByText('We hope you had fun')).toBeVisible();
  });

  it('should fetch and display archives', () => {
    mockUseArchives.mockReturnValue([availableArchive, failedArchive, pendingArchive]);
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );
    expect(screen.getByText('Recording 1')).toBeVisible();
    expect(screen.getByTestId('archive-loading-spinner')).toBeVisible();
  });
});
