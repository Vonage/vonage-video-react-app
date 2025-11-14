import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MenuItem from '@ui/MenuItem';
import Menu from './index';

describe('Menu', () => {
  it('renders correctly when open', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    render(
      <Menu open anchorEl={anchorElement}>
        <MenuItem>Menu Item 1</MenuItem>
        <MenuItem>Menu Item 2</MenuItem>
      </Menu>
    );

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Menu Item 1')).toBeInTheDocument();
    expect(screen.getByText('Menu Item 2')).toBeInTheDocument();

    document.body.removeChild(anchorElement);
  });

  it('does not render when closed', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    render(
      <Menu open={false} anchorEl={anchorElement}>
        <MenuItem>Hidden Item</MenuItem>
      </Menu>
    );

    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.queryByText('Hidden Item')).not.toBeInTheDocument();

    document.body.removeChild(anchorElement);
  });

  it('renders with different anchor origins', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    render(
      <Menu
        open
        anchorEl={anchorElement}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        data-testid="anchored-menu"
      >
        <MenuItem>Anchored Item</MenuItem>
      </Menu>
    );

    expect(screen.getByRole('menu')).toBeInTheDocument();

    document.body.removeChild(anchorElement);
  });

  it('renders with different transform origins', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    render(
      <Menu
        open
        anchorEl={anchorElement}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <MenuItem>Transform Item</MenuItem>
      </Menu>
    );

    expect(screen.getByRole('menu')).toBeInTheDocument();

    document.body.removeChild(anchorElement);
  });

  it('handles keepMounted prop', () => {
    const anchorElement = document.createElement('div');
    document.body.appendChild(anchorElement);

    render(
      <Menu open={false} anchorEl={anchorElement} keepMounted>
        <MenuItem>Kept mounted item</MenuItem>
      </Menu>
    );

    expect(screen.getByText('Kept mounted item')).toBeInTheDocument();

    document.body.removeChild(anchorElement);
  });
});
