import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Tab from './index';

describe('Tab', () => {
  it('renders correctly', () => {
    render(<Tab label="Test Tab" />);

    const tab = screen.getByRole('tab', { name: 'Test Tab' });
    expect(tab).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();

    render(<Tab label="Clickable Tab" onClick={handleClick} />);

    const tab = screen.getByRole('tab', { name: 'Clickable Tab' });
    fireEvent.click(tab);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders with value prop', () => {
    render(<Tab label="Tab with Value" value="tab1" />);

    const tab = screen.getByRole('tab', { name: 'Tab with Value' });
    expect(tab).toBeInTheDocument();
  });
});
