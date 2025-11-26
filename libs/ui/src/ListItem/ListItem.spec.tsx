import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ListItemText from '@ui/ListItemText';
import ListItemIcon from '@ui/ListItemIcon';
import ListItem from './index';

describe('ListItem', () => {
  it('renders correctly', () => {
    render(
      <ListItem>
        <ListItemText primary="Test Item" />
      </ListItem>
    );

    const listItem = screen.getByRole('listitem');
    expect(listItem).toBeInTheDocument();
    expect(listItem).toHaveClass('MuiListItem-root');
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();

    render(
      <ListItem onClick={handleClick}>
        <ListItemText primary="Clickable Item" />
      </ListItem>
    );

    const listItem = screen.getByRole('listitem');
    fireEvent.click(listItem);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    const TestIcon = () => <span>📋</span>;

    render(
      <ListItem>
        <ListItemIcon>
          <TestIcon />
        </ListItemIcon>
        <ListItemText primary="Item with Icon" />
      </ListItem>
    );

    expect(screen.getByText('📋')).toBeInTheDocument();
    expect(screen.getByText('Item with Icon')).toBeInTheDocument();
  });

  it('renders with dense spacing', () => {
    render(
      <ListItem dense data-testid="dense-item">
        <ListItemText primary="Dense Item" />
      </ListItem>
    );

    const listItem = screen.getByTestId('dense-item');
    expect(listItem).toHaveClass('MuiListItem-dense');
  });

  it('renders with divider', () => {
    render(
      <ListItem divider data-testid="divider-item">
        <ListItemText primary="Item with divider" />
      </ListItem>
    );

    const listItem = screen.getByTestId('divider-item');
    expect(listItem).toHaveClass('MuiListItem-divider');
  });

  it('renders with secondary action', () => {
    render(
      <ListItem secondaryAction={<button type="button">Delete</button>}>
        <ListItemText primary="Item with action" />
      </ListItem>
    );

    expect(screen.getByText('Item with action')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });
});
