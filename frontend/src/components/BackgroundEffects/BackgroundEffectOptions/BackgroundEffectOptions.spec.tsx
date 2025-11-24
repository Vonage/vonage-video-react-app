import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import BackgroundEffectOptions from './BackgroundEffectOptions';

describe('BackgroundEffectOptions', () => {
  const setBackgroundSelected = vi.fn();
  const clearBgWhenSelectedDeleted = vi.fn();
  const customBackgroundImageChange = vi.fn();

  it('renders background options grid with effects and gallery', () => {
    render(
      <BackgroundEffectOptions
        mode="meeting"
        backgroundSelected=""
        setBackgroundSelected={setBackgroundSelected}
        cleanupSelectedBackgroundReplacement={clearBgWhenSelectedDeleted}
        customBackgroundImageChange={customBackgroundImageChange}
      />
    );

    expect(screen.getByTestId('vivid-icon-remove-line')).toBeInTheDocument();
    expect(screen.getByTestId('vivid-icon-blur-line')).toBeInTheDocument();

    expect(screen.getByAltText('Bookshelf Room')).toBeInTheDocument();
    expect(screen.getByAltText('Busy Room')).toBeInTheDocument();
  });
});
