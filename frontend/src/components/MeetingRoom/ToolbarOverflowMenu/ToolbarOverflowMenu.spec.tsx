import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { Button } from '@mui/material';
import ToolbarOverflowMenu from './ToolbarOverflowMenu';

const mockOpenEmojiGrid = vi.fn();
const mockHandleClickAway = vi.fn();
vi.mock('../../../hooks/useSessionContext', () => ({
  default: () => ({
    subscriberWrappers: [],
  }),
}));
vi.mock('../../../hooks/useRoomName');

const TestComponent = ({ defaultOpen = false }: { defaultOpen?: boolean }) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <Button ref={anchorRef} />
      <ToolbarOverflowMenu
        isToolbarOverflowMenuOpen={defaultOpen}
        isEmojiGridOpen
        setIsEmojiGridOpen={mockOpenEmojiGrid}
        anchorRef={anchorRef}
        handleClickAway={mockHandleClickAway}
      />
    </>
  );
};

describe('ToolbarOverflowMenu', () => {
  it('is shown when open', () => {
    render(<TestComponent defaultOpen />);

    expect(screen.getByTestId('toolbar-overflow-menu')).toBeVisible();
  });

  it('is not shown when closed', () => {
    render(<TestComponent />);

    expect(screen.queryByTestId('toolbar-overflow-menu')).not.toBeInTheDocument();
  });

  it('renders all the available buttons including the Report Issue button if enabled', () => {
    vi.stubEnv('VITE_ENABLE_REPORT_ISSUE', 'true');
    render(<TestComponent defaultOpen />);
    expect(screen.getByTestId('layout-toggle')).toBeVisible();
    expect(screen.getByTestId('archiving-toggle')).toBeVisible();
    expect(screen.getByTestId('report-issue-button')).toBeVisible();
    expect(screen.getByTestId('participant-list-toggle')).toBeVisible();
    expect(screen.getByTestId('chat-toggle')).toBeVisible();
  });

  it('does not render Report Issue button in overflow menu if it was disabled', () => {
    vi.stubEnv('VITE_ENABLE_REPORT_ISSUE', 'false');
    render(<TestComponent defaultOpen />);
    expect(screen.getByTestId('layout-toggle')).toBeVisible();
    expect(screen.getByTestId('archiving-toggle')).toBeVisible();
    expect(screen.queryByTestId('report-issue-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('participant-list-toggle')).toBeVisible();
    expect(screen.getByTestId('chat-toggle')).toBeVisible();
  });
});
