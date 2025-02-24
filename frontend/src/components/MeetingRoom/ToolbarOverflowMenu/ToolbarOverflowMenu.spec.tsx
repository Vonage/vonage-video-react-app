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
});
