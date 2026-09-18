import { render as renderBase, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ReactElement } from 'react';
import { makeTestProvider } from '@test/providers';
import MiniModeButton from './MiniModeButton';
import { useMiniMode } from '../../../Context/MiniMode';

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

describe('MiniModeButton', () => {
  const enter = vi.fn();
  const exit = vi.fn();

  beforeEach(() => {
    enter.mockReset();
    exit.mockReset();
    mockUseMiniMode.mockReturnValue({
      isSupported: true,
      isOpen: false,
      hostedElement: null,
      enter,
      exit,
      toggleAudio: vi.fn(),
      toggleVideo: vi.fn(),
      leave: vi.fn(),
      isAudioEnabled: true,
      isVideoEnabled: true,
      participant: null,
    });
  });

  it('renders when Mini Mode is supported', () => {
    render(<MiniModeButton />);
    expect(screen.getByTestId('mini-mode-button')).toBeVisible();
  });

  it('is hidden when Mini Mode is not supported', () => {
    mockUseMiniMode.mockReturnValue({
      ...mockUseMiniMode(),
      isSupported: false,
    });
    render(<MiniModeButton />);
    expect(screen.queryByTestId('mini-mode-button')).not.toBeInTheDocument();
  });

  it('enters Mini Mode on click', () => {
    render(<MiniModeButton />);
    screen.getByTestId('mini-mode-button').click();
    expect(enter).toHaveBeenCalledOnce();
  });

  it('exits Mini Mode on click when already open', () => {
    mockUseMiniMode.mockReturnValue({
      ...mockUseMiniMode(),
      isOpen: true,
    });
    render(<MiniModeButton />);
    screen.getByTestId('mini-mode-button').click();
    expect(exit).toHaveBeenCalledOnce();
    expect(enter).not.toHaveBeenCalled();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);
  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
