import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import BackgroundEffectOptions from './BackgroundEffectOptions';

describe('BackgroundEffectOptions', () => {
  const setBackgroundSelected = vi.fn();
  const clearBgWhenSelectedDeleted = vi.fn();
  const customBackgroundImageChange = vi.fn();

  it('renders tabs and defaults to Backgrounds tab', () => {
    render(
      <BackgroundEffectOptions
        mode="meeting"
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
});
