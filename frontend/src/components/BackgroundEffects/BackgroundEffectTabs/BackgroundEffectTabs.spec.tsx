import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect } from 'vitest';
import BackgroundEffectTabs from './BackgroundEffectTabs';

describe('BackgroundEffectTabs', () => {
  const setTabSelected = vi.fn();
  const setBackgroundSelected = vi.fn();
  const clearBgWhenSelectedDeleted = vi.fn();
  const customBackgroundImageChange = vi.fn();

  it('renders tabs and defaults to Backgrounds tab', () => {
    render(
      <BackgroundEffectTabs
        mode="meeting"
        tabSelected={0}
        setTabSelected={setTabSelected}
        backgroundSelected=""
        setBackgroundSelected={setBackgroundSelected}
        cleanupSelectedBackgroundReplacement={clearBgWhenSelectedDeleted}
        customBackgroundImageChange={customBackgroundImageChange}
      />
    );
    expect(screen.getByRole('tab', { name: /Backgrounds/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Add Background/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Backgrounds/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('switches to Add Background tab when clicked', async () => {
    render(
      <BackgroundEffectTabs
        mode="meeting"
        tabSelected={0}
        setTabSelected={setTabSelected}
        backgroundSelected=""
        setBackgroundSelected={setBackgroundSelected}
        cleanupSelectedBackgroundReplacement={clearBgWhenSelectedDeleted}
        customBackgroundImageChange={customBackgroundImageChange}
      />
    );
    const addTab = screen.getByRole('tab', { name: /Add Background/i });
    await userEvent.click(addTab);
    expect(setTabSelected).toHaveBeenCalledWith(1);
  });

  it('renders AddBackgroundEffectLayout when Add Background tab is selected', () => {
    render(
      <BackgroundEffectTabs
        mode="waiting"
        tabSelected={1}
        setTabSelected={setTabSelected}
        backgroundSelected=""
        setBackgroundSelected={setBackgroundSelected}
        cleanupSelectedBackgroundReplacement={clearBgWhenSelectedDeleted}
        customBackgroundImageChange={customBackgroundImageChange}
      />
    );
    expect(screen.getByText(/upload/i)).toBeInTheDocument();
  });
});
