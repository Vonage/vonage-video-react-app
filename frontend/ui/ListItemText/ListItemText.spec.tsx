import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ListItemText from './index';

describe('ListItemText', () => {
  it('renders correctly with primary text', () => {
    render(<ListItemText primary="Primary text" />);

    const primaryText = screen.getByText('Primary text');
    expect(primaryText).toBeInTheDocument();

    const container = primaryText.closest('.MuiListItemText-root');
    expect(container).toBeInTheDocument();
  });

  it('renders with primary and secondary text', () => {
    render(<ListItemText primary="Main title" secondary="Subtitle description" />);

    expect(screen.getByText('Main title')).toBeInTheDocument();
    expect(screen.getByText('Subtitle description')).toBeInTheDocument();
  });

  it('renders with custom components', () => {
    render(
      <ListItemText
        primary={<span data-testid="custom-primary">Custom Primary</span>}
        secondary={<em data-testid="custom-secondary">Custom Secondary</em>}
      />
    );

    expect(screen.getByTestId('custom-primary')).toBeInTheDocument();
    expect(screen.getByTestId('custom-secondary')).toBeInTheDocument();
  });

  it('renders with inset prop', () => {
    render(<ListItemText primary="Inset text" inset data-testid="inset-text" />);

    const listItemText = screen.getByTestId('inset-text');
    expect(listItemText).toHaveClass('MuiListItemText-inset');
  });

  it('renders within ListItem context', () => {
    render(
      <div role="listitem">
        <ListItemText primary="List item title" secondary="List item description" />
      </div>
    );

    expect(screen.getByText('List item title')).toBeInTheDocument();
    expect(screen.getByText('List item description')).toBeInTheDocument();
  });

  it('handles only secondary text', () => {
    render(<ListItemText secondary="Only secondary text" />);

    expect(screen.getByText('Only secondary text')).toBeInTheDocument();
  });

  it('renders with different typography variants', () => {
    render(
      <ListItemText
        primary="Primary text"
        secondary="Secondary text"
        primaryTypographyProps={{ variant: 'h6' }}
        secondaryTypographyProps={{ variant: 'caption' }}
      />
    );

    expect(screen.getByText('Primary text')).toBeInTheDocument();
    expect(screen.getByText('Secondary text')).toBeInTheDocument();
  });

  it('renders with long text content', () => {
    const longPrimary = 'This is a very long primary text that might wrap to multiple lines';
    const longSecondary =
      'This is a very long secondary text that provides additional details and context';

    render(<ListItemText primary={longPrimary} secondary={longSecondary} />);

    expect(screen.getByText(longPrimary)).toBeInTheDocument();
    expect(screen.getByText(longSecondary)).toBeInTheDocument();
  });
});
