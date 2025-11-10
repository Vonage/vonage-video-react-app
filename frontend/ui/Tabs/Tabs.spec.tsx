import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Tab from '@ui/Tab';
import Tabs from './index';

describe('Tabs', () => {
  it('renders correctly', () => {
    render(
      <Tabs value={0}>
        <Tab label="Tab 1" />
        <Tab label="Tab 2" />
        <Tab label="Tab 3" />
      </Tabs>
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(3);
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('handles tab changes', () => {
    const handleChange = vi.fn();

    render(
      <Tabs value={0} onChange={handleChange}>
        <Tab label="First" />
        <Tab label="Second" />
      </Tabs>
    );

    const secondTab = screen.getByRole('tab', { name: 'Second' });
    fireEvent.click(secondTab);

    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('shows active tab', () => {
    render(
      <Tabs value={1}>
        <Tab label="Tab 1" />
        <Tab label="Tab 2" />
        <Tab label="Tab 3" />
      </Tabs>
    );

    const activeTab = screen.getByRole('tab', { name: 'Tab 2' });
    expect(activeTab).toHaveAttribute('aria-selected', 'true');

    const inactiveTabs = screen
      .getAllByRole('tab')
      .filter((tab) => tab.getAttribute('aria-selected') === 'false');
    expect(inactiveTabs).toHaveLength(2);
  });

  it('renders with different orientations', () => {
    const { rerender } = render(
      <Tabs value={0} orientation="horizontal">
        <Tab label="Horizontal 1" />
        <Tab label="Horizontal 2" />
      </Tabs>
    );

    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();

    rerender(
      <Tabs value={0} orientation="vertical">
        <Tab label="Vertical 1" />
        <Tab label="Vertical 2" />
      </Tabs>
    );

    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
  });
});
