import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MenuMoreOptions from './MenuMoreOptions';

describe('MenuMoreOptions', () => {
  const mockOnClose = vi.fn();
  const mockAnchorEl = document.createElement('button');

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should render when open is true', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByTestId('menu-more-options')).toBeInTheDocument();
  });

  it('should not render menu items when open is false', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open={false} anchorEl={mockAnchorEl} />);

    expect(screen.queryByText(/background effects/i)).not.toBeInTheDocument();
  });

  it('should display background effects option', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByText(/background effects/i)).toBeInTheDocument();
  });

  it('should call onClose when clicking on background effects option', async () => {
    const user = userEvent.setup();
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    const menuItem = screen.getByText(/background effects/i);
    await user.click(menuItem);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display icon for background effects', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByTestId('vivid-icon-gallery-line')).toBeInTheDocument();
  });
});
