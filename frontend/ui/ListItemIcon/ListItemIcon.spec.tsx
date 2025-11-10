import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ListItemIcon from './index';

describe('ListItemIcon', () => {
  it('renders correctly', () => {
    render(
      <ListItemIcon>
        <span>📋</span>
      </ListItemIcon>
    );

    const listItemIcon = screen.getByText('📋');
    expect(listItemIcon).toBeInTheDocument();

    const container = listItemIcon.closest('.MuiListItemIcon-root');
    expect(container).toBeInTheDocument();
  });

  it('renders with different icon types', () => {
    const { rerender } = render(
      <ListItemIcon>
        <span>⚙️</span>
      </ListItemIcon>
    );

    expect(screen.getByText('⚙️')).toBeInTheDocument();

    rerender(
      <ListItemIcon>
        <div data-testid="custom-icon">Custom Icon</div>
      </ListItemIcon>
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders within ListItem context', () => {
    render(
      <div role="listitem">
        <ListItemIcon>
          <span>📄</span>
        </ListItemIcon>
        <div>Document Item</div>
      </div>
    );

    expect(screen.getByText('📄')).toBeInTheDocument();
    expect(screen.getByText('Document Item')).toBeInTheDocument();
  });

  it('maintains proper alignment', () => {
    render(
      <ListItemIcon data-testid="aligned-icon">
        <span>🏠</span>
      </ListItemIcon>
    );

    const listItemIcon = screen.getByTestId('aligned-icon');
    expect(listItemIcon).toHaveClass('MuiListItemIcon-root');
  });
});
