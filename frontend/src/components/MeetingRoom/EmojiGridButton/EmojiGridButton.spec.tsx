import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useState } from 'react';
import EmojiGridButton from './EmojiGridButton';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';

vi.mock('../../../hooks/useIsSmallViewport');
vi.mock('../../../utils/emojis', () => ({
  default: { FAVORITE: '🦧' },
}));

const mockUseIsSmallViewport = useIsSmallViewport as Mock<[], boolean>;

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
    mockUseIsSmallViewport.mockReturnValue(false);
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
