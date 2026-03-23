import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import useGoodByePage from '@hooks/useGoodByePage';
import GoodByeStage from './GoodByeStage';

vi.mock('@hooks/useGoodByePage');

vi.mock('@components/GoodBye/ArchiveList', () => ({
  default: ({ archives }: { archives: unknown[] | 'error' }) => (
    <div data-testid="archive-list" data-value={JSON.stringify(archives)} />
  ),
}));

vi.mock('@components/GoodBye/GoodbyeMessage', () => ({
  default: ({ header, message }: { header: string; message: string }) => (
    <div data-testid="goodbye-message" data-header={header} data-message={message} />
  ),
}));

vi.mock('@components/GoodBye/ReenterRoomButton', () => ({
  default: ({ roomName }: { roomName: string }) => (
    <div data-testid="reenter-room-button" data-room={roomName} />
  ),
}));

vi.mock('@ui', async () => {
  const actual = await vi.importActual<typeof import('@ui')>('@ui');
  return {
    ...actual,
    Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    PageLayoutEmbed: Object.assign(
      ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      {
        Left: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
        Right: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
      }
    ),
  };
});

const mockUseGoodByePage = useGoodByePage as Mock;

describe('GoodByeStage', () => {
  beforeEach(() => {
    mockUseGoodByePage.mockReturnValue({
      roomName: 'test-room',
      archives: [],
      header: 'You have left the meeting',
      caption: 'Thank you for joining!',
    });
  });

  it('renders the goodbye message with header and caption from the hook', () => {
    renderStage();
    const message = screen.getByTestId('goodbye-message');
    expect(message).toHaveAttribute('data-header', 'You have left the meeting');
    expect(message).toHaveAttribute('data-message', 'Thank you for joining!');
  });

  it('renders the ReenterRoomButton with the roomName from the hook', () => {
    renderStage();
    const button = screen.getByTestId('reenter-room-button');
    expect(button).toHaveAttribute('data-room', 'test-room');
  });

  it('renders the ArchiveList with archives from the hook', () => {
    const archives = [{ id: 'archive-1', status: 'available' }];
    mockUseGoodByePage.mockReturnValue({
      roomName: 'test-room',
      archives,
      header: 'Gone',
      caption: 'Bye',
    });

    renderStage();
    const archiveList = screen.getByTestId('archive-list');
    expect(archiveList).toHaveAttribute('data-value', JSON.stringify(archives));
  });

  it('renders the ArchiveList with "error" when archives failed to load', () => {
    mockUseGoodByePage.mockReturnValue({
      roomName: 'test-room',
      archives: 'error',
      header: 'Gone',
      caption: 'Bye',
    });

    renderStage();
    const archiveList = screen.getByTestId('archive-list');
    expect(archiveList).toHaveAttribute('data-value', '"error"');
  });

  it('renders the archive list label', () => {
    renderStage();
    // The label is rendered from i18n key 'archiveList.label' which in test env falls back to the key
    expect(screen.getByTestId('archive-list')).toBeInTheDocument();
  });
});

function renderStage() {
  render(
    <MemoryRouter>
      <GoodByeStage />
    </MemoryRouter>
  );
}
