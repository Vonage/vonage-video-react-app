import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';
import backgroundEffectsDialog$ from '@Context/BackgroundEffectsDialog';
import precallNetworkTestDialog$ from '@Context/PrecallNetworkTestDialog';
import composeProviders from '@utils/composeProviders';
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

    expect(screen.queryByText(/background settings/i)).not.toBeInTheDocument();
  });

  it('should display background effects option', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByText(/background settings/i)).toBeInTheDocument();
  });

  it('should call onClose when clicking on background effects option', async () => {
    const user = userEvent.setup();
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    const menuItem = screen.getByText(/background settings/i);
    await user.click(menuItem);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display icon for background effects', () => {
    render(<MenuMoreOptions onClose={mockOnClose} open anchorEl={mockAnchorEl} />);

    expect(screen.getByTestId('vivid-icon-gallery-line')).toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const wrapper = composeProviders(
    backgroundEffectsDialog$.Provider,
    precallNetworkTestDialog$.Provider
  );
  return renderBase(ui, { wrapper });
}
