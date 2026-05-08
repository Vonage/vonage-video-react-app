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
    const expectedDuration = EMOJI_DISPLAY_DURATION + 100;

    expect(container).toHaveStyle({
      position: 'absolute',
      animationName: 'moveEmoji',
      animationDuration: `${expectedDuration}ms`,
      animationTimingFunction: 'linear',
      animationIterationCount: '1',
      maxWidth: '35%',
      zIndex: '1',
    });
  });
});
