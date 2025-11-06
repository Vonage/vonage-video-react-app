import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Header from './Header';

describe('Header', () => {
  it('renders correctly', () => {
    render(<Header>Header content</Header>);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('renders children in toolbar', () => {
    render(
      <Header>
        <div>Navigation Item</div>
        <div>User Menu</div>
      </Header>
    );

    expect(screen.getByText('Navigation Item')).toBeInTheDocument();
    expect(screen.getByText('User Menu')).toBeInTheDocument();
  });

  it('renders with different AppBar positions', () => {
    const { rerender } = render(<Header appBarProps={{ position: 'fixed' }}>Fixed header</Header>);

    const banner = screen.getByRole('banner');
    expect(banner).toHaveClass('MuiAppBar-positionFixed');

    rerender(<Header appBarProps={{ position: 'sticky' }}>Sticky header</Header>);

    expect(banner).toHaveClass('MuiAppBar-positionSticky');
  });
});
