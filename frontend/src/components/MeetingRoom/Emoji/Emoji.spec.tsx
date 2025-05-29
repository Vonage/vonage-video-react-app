import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Emoji from './index';
import { EMOJI_DISPLAY_DURATION } from '../../../utils/constants';

describe('Emoji component', () => {
  const emojiWrapper = {
    emoji: '😀',
    name: 'Happy Face',
    time: Date.now(),
  };

  it('renders emoji and name label correctly', () => {
    render(<Emoji emojiWrapper={{ ...emojiWrapper }} />);

    expect(screen.getByText(emojiWrapper.emoji)).toBeInTheDocument();
    expect(screen.getByText(emojiWrapper.name)).toBeInTheDocument();
  });

  it('applies correct inline styles including animationDuration', () => {
    render(<Emoji emojiWrapper={{ ...emojiWrapper }} />);

    const container = screen.getByTestId('emoji-string-container');
    expect(container).toHaveStyle({
      position: 'absolute',
      animationName: 'moveEmoji',
      animationTimingFunction: 'linear',
      animationIterationCount: '1',
      maxWidth: '35%',
      zIndex: '1',
    });

    const duration = container.style.animationDuration;
    const expectedDuration = EMOJI_DISPLAY_DURATION + 100;
    expect(parseInt(duration, 10)).toBe(expectedDuration);
  });

  it('applies expected Tailwind classes to container and Chip', () => {
    render(<Emoji emojiWrapper={{ ...emojiWrapper }} />);

    const container = screen.getByTestId('emoji-string-container');
    expect(container).toHaveClass(
      'ml-5',
      'flex',
      'flex-col',
      'text-5xl',
      'md:ml-[15%]',
      'md:text-6xl'
    );

    const chip = screen.getByText(emojiWrapper.name).parentElement!;
    expect(chip).toHaveClass('truncate', 'text-sm', 'md:text-lg');
  });
});
