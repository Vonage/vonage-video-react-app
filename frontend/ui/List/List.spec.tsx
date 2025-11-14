import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ListItem from '@ui/ListItem';
import ListItemText from '@ui/ListItemText';
import List from './index';

describe('List', () => {
  it('renders correctly', () => {
    render(
      <List>
        <ListItem>
          <ListItemText primary="Item 1" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Item 2" />
        </ListItem>
      </List>
    );

    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveClass('MuiList-root');

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('renders with dense spacing', () => {
    render(
      <List dense data-testid="dense-list">
        <ListItem>
          <ListItemText primary="Dense Item 1" />
        </ListItem>
        <ListItem>
          <ListItemText primary="Dense Item 2" />
        </ListItem>
      </List>
    );

    const list = screen.getByTestId('dense-list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveClass('MuiList-dense');
  });

  it('renders with subheader', () => {
    render(
      <List subheader={<div>List Subheader</div>}>
        <ListItem>
          <ListItemText primary="Item under subheader" />
        </ListItem>
      </List>
    );

    expect(screen.getByText('List Subheader')).toBeInTheDocument();
    expect(screen.getByText('Item under subheader')).toBeInTheDocument();
  });

  it('renders with multiple list items', () => {
    const items = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry'];

    render(
      <List>
        {items.map((item) => (
          <ListItem key={item}>
            <ListItemText primary={item} />
          </ListItem>
        ))}
      </List>
    );

    items.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });

    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(5);
  });

  it('renders with nested lists', () => {
    render(
      <List>
        <ListItem>
          <ListItemText primary="Parent item 1" />
        </ListItem>
        <List component="div" disablePadding>
          <ListItem sx={{ pl: 4 }}>
            <ListItemText primary="Nested item 1" />
          </ListItem>
          <ListItem sx={{ pl: 4 }}>
            <ListItemText primary="Nested item 2" />
          </ListItem>
        </List>
        <ListItem>
          <ListItemText primary="Parent item 2" />
        </ListItem>
      </List>
    );

    expect(screen.getByText('Parent item 1')).toBeInTheDocument();
    expect(screen.getByText('Nested item 1')).toBeInTheDocument();
    expect(screen.getByText('Nested item 2')).toBeInTheDocument();
    expect(screen.getByText('Parent item 2')).toBeInTheDocument();
  });
});
