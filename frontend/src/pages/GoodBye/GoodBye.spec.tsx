import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BrowserRouter from '@test/RouterWrapper';
import GoodBye from './index';
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

    expect(screen.getByText('You have left the meeting')).toBeVisible();
    expect(screen.getByText('Thank you for joining!')).toBeVisible();
  });

  it('should fetch and display archives', () => {
    mockUseArchives.mockReturnValue([availableArchive, failedArchive, pendingArchive]);
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );
    expect(screen.getByText('We are processing your recording')).toBeVisible();
    expect(screen.getByTestId('archive-loading-spinner')).toBeVisible();
  });

  it('should display "Rejoining the room" button', () => {
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );
    expect(screen.getByText('Rejoining the room')).toBeVisible();
  });

  it('should display "Go to landing page" button', () => {
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );
    expect(screen.getByText('View Landing Page')).toBeVisible();
  });

  it('should display empty message when there are no archives', () => {
    mockUseArchives.mockReturnValue([]);
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );
    expect(screen.getByText("The meeting hasn't been recorded")).toBeVisible();
  });

  it('should display error message when archives fail to load', () => {
    mockUseArchives.mockReturnValue('error');
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );
    expect(
      screen.getByText('There was an error loading recordings for this meeting')
    ).toBeVisible();
  });

  it('should display available archive with download button', () => {
    mockUseArchives.mockReturnValue([availableArchive]);
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );
    const listItem = screen.getByTestId(`archive-list-item-${availableArchive.id}`);
    expect(listItem).toBeVisible();
    expect(screen.getByTestId('archive-download-button')).toBeVisible();
  });

  it('should display failed archive with error icon', () => {
    mockUseArchives.mockReturnValue([failedArchive]);
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );
    expect(screen.getByTestId('archive-error-icon')).toBeVisible();
  });

  it('should display pending archive with loading spinner', () => {
    mockUseArchives.mockReturnValue([pendingArchive]);
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );
    expect(screen.getByTestId('archive-loading-spinner')).toBeVisible();
  });

  it('should display recordings section title', () => {
    mockUseArchives.mockReturnValue([availableArchive]);
    render(
      <BrowserRouter>
        <GoodBye />
      </BrowserRouter>
    );
    expect(screen.getByText('Download recordings')).toBeVisible();
  });
});
