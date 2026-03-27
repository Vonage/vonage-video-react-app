import { act, render as renderBase, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { ReactElement, useState } from 'react';
import { makeTestProvider } from '@test/providers';
import useMediaQuery from '@mui/material/useMediaQuery';
import EmojiGridButton from './EmojiGridButton';
import { env } from '../../../env';

vi.mock('@mui/material/useMediaQuery', () => ({
  default: vi.fn(),
}));
vi.mock('@utils/emojis', () => ({
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
    (useMediaQuery as Mock).mockReturnValue(false);
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

  it('is not rendered when allowEmojis is false', () => {
    env.partialUpdate({
      ALLOW_EMOJIS: false,
    });

    render(<TestComponent />);

    expect(screen.queryByTestId('emoji-grid-button')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
