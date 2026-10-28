import { render as renderBase, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { makeTestProvider, providers, type ProviderOptions } from '@test/providers';
import MiniModeButton from './MiniModeButton';

describe('MiniModeButton', () => {
  it('renders the toolbar button with an accessible label when Mini Mode is supported', () => {
    render(<MiniModeButton />, { miniModeContext: { isSupported: true } });

    const button = screen.getByTestId('mini-mode-button');
    expect(button).toBeVisible();
    expect(button).toHaveAttribute('aria-label');
  });

  it('is hidden when Mini Mode is not supported', () => {
    render(<MiniModeButton />);

    expect(screen.queryByTestId('mini-mode-button')).not.toBeInTheDocument();
  });

  it('enters Mini Mode on click', () => {
    const enter = vi.fn();
    const exit = vi.fn();
    render(<MiniModeButton />, { miniModeContext: { isSupported: true, enter, exit } });

    screen.getByTestId('mini-mode-button').click();

    expect(enter).toHaveBeenCalledOnce();
    expect(exit).not.toHaveBeenCalled();
  });

  it('exits Mini Mode on click when already open', () => {
    const enter = vi.fn();
    const exit = vi.fn();
    render(<MiniModeButton />, {
      miniModeContext: { isSupported: true, isOpen: true, enter, exit },
    });

    screen.getByTestId('mini-mode-button').click();

    expect(exit).toHaveBeenCalledOnce();
    expect(enter).not.toHaveBeenCalled();
  });

  it('renders as an overflow button and invokes handleClick alongside enter', () => {
    const handleClick = vi.fn();
    const enter = vi.fn();

    render(<MiniModeButton isOverflowButton handleClick={handleClick} />, {
      miniModeContext: { isSupported: true, enter },
    });

    screen.getByTestId('mini-mode-button').click();

    expect(enter).toHaveBeenCalledOnce();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

type RenderOptions = {
  miniModeContext?: ProviderOptions['MiniModeContext'];
};

function render(ui: ReactElement, { miniModeContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider([providers.miniMode], { miniModeContext });

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
