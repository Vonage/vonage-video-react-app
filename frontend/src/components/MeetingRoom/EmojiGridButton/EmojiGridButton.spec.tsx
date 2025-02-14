import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useRef } from 'react';
import EmojiGridButton from './EmojiGridButton';

const mockSetOpenEmojiGrid = vi.fn();

const TestComponent = () => {
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <EmojiGridButton anchorRef={anchorRef} openEmojiGrid setOpenEmojiGrid={mockSetOpenEmojiGrid} />
  );
};

describe('EmojiGridButton', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders', () => {
    render(<TestComponent />);

    expect(screen.getByTestId('emoji-grid-toggle')).toBeVisible();
  });

  it('clicking calls the setter', () => {
    render(<TestComponent />);

    act(() => {
      screen.getByTestId('emoji-grid-toggle').click();
    });

    expect(mockSetOpenEmojiGrid).toHaveBeenCalledTimes(1);
  });
});
