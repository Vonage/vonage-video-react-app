import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { useState } from 'react';
import * as mui from '@mui/material';
import EmojiGridButton from './EmojiGridButton';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof mui>('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});
vi.mock('../../../utils/emojis', () => ({
  default: { FAVORITE: '🦧' },
}));

const TestComponent = ({ defaultOpenEmojiGrid = false }: { defaultOpenEmojiGrid?: boolean }) => {
  const [isEmojiGridOpen, setIsEmojiGridOpen] = useState(defaultOpenEmojiGrid);
  return (
    <EmojiGridButton
      isEmojiGridOpen={isEmojiGridOpen}
      setIsEmojiGridOpen={setIsEmojiGridOpen}
      isParentOpen
    />
  );
};

describe('EmojiGridButton', () => {
  beforeEach(() => {
    (mui.useMediaQuery as Mock).mockReturnValue(false);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('emoji-grid-button')).toBeVisible();
  });

  it('clicking opens the emoji grid', () => {
    const { rerender } = render(<TestComponent />);
    expect(screen.queryByTestId('emoji-grid')).not.toBeInTheDocument();

    act(() => {
      screen.getByTestId('emoji-grid-button').click();
    });

    rerender(<TestComponent />);
    expect(screen.getByTestId('emoji-grid')).toBeVisible();
  });
});
