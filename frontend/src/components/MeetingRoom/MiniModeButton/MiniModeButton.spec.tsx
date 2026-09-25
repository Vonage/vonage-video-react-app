import { render as renderBase, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactElement } from 'react';
import { makeTestProvider } from '@test/providers';
import MiniModeButton from './MiniModeButton';
import { useMiniMode } from '../../../Context/MiniMode';
import type { MiniModeContextType } from '../../../Context/MiniMode/MiniModeContext';

vi.mock('../../../Context/MiniMode', async () => {
  const actual = await vi.importActual<typeof import('../../../Context/MiniMode')>(
    '../../../Context/MiniMode'
  );
  return {
    ...actual,
    useMiniMode: vi.fn(),
  };
});

const mockUseMiniMode = vi.mocked(useMiniMode);

const makeContextValue = (overrides: Partial<MiniModeContextType> = {}): MiniModeContextType => ({
  isSupported: true,
  isOpen: false,
  hostedElement: null,
  enter: vi.fn(),
  exit: vi.fn(),
  toggleAudio: vi.fn(),
  toggleVideo: vi.fn(),
  leave: vi.fn(),
  isAudioEnabled: true,
  isVideoEnabled: true,
  participant: null,
  ...overrides,
});

describe('MiniModeButton', () => {
  const enter = vi.fn();
  const exit = vi.fn();

  beforeEach(() => {
    enter.mockReset();
    exit.mockReset();
    mockUseMiniMode.mockReturnValue(makeContextValue({ enter, exit }));
  });

  it('renders the toolbar button with an accessible label when Mini Mode is supported', () => {
    render(<MiniModeButton />);

    const button = screen.getByTestId('mini-mode-button');
    expect(button).toBeVisible();
    expect(button).toHaveAttribute('aria-label');
  });

  it('is hidden when Mini Mode is not supported', () => {
    mockUseMiniMode.mockReturnValue(makeContextValue({ isSupported: false }));

    render(<MiniModeButton />);

    expect(screen.queryByTestId('mini-mode-button')).not.toBeInTheDocument();
  });

  it('enters Mini Mode on click', () => {
    render(<MiniModeButton />);

    screen.getByTestId('mini-mode-button').click();

    expect(enter).toHaveBeenCalledOnce();
    expect(exit).not.toHaveBeenCalled();
  });

  it('exits Mini Mode on click when already open', () => {
    mockUseMiniMode.mockReturnValue(makeContextValue({ enter, exit, isOpen: true }));

    render(<MiniModeButton />);

    screen.getByTestId('mini-mode-button').click();

    expect(exit).toHaveBeenCalledOnce();
    expect(enter).not.toHaveBeenCalled();
  });

  it('renders as an overflow button and invokes handleClick alongside enter', () => {
    const handleClick = vi.fn();

    render(<MiniModeButton isOverflowButton handleClick={handleClick} />);

    screen.getByTestId('mini-mode-button').click();

    expect(enter).toHaveBeenCalledOnce();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);
  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
