import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EmojiGridButton from './EmojiGridButton';

const mockSetOpenEmojiGrid = vi.fn();

const TestComponent = () => {
  return <EmojiGridButton openEmojiGrid setOpenEmojiGrid={mockSetOpenEmojiGrid} />;
};

describe('EmojiGridButton', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('emoji-grid-toggle')).toBeVisible();
  });

  it('clicking opens the emoji grid', () => {
    render(<TestComponent />);

    act(() => {
      screen.getByTestId('emoji-grid-toggle').click();
    });

    expect(mockSetOpenEmojiGrid).toHaveBeenCalledTimes(1);
  });
});
