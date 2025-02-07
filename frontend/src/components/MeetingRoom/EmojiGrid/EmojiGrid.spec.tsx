import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { Button } from '@mui/material';
import useUserContext from '../../../hooks/useUserContext';
import EmojiGrid from './EmojiGrid';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import SendEmojiButton from '../SendEmojiButton';
import { UserContextType } from '../../../Context/user';

vi.mock('../../../hooks/useUserContext');
vi.mock('../../../hooks/useIsSmallViewport');
vi.mock('../SendEmojiButton');
vi.mock('../../../utils/emojis', () => ({
  default: { FAVORITE: '🦧' },
}));

const mockUseUserContext = useUserContext as Mock<[], UserContextType>;
const mockUseIsSmallViewport = useIsSmallViewport as Mock<[], boolean>;
const mockSetUser = vi.fn();
const mockSendEmojiButton = SendEmojiButton as Mock<[], ReactElement>;

const defaultUserContext = {
  user: {
    defaultSettings: {
      openEmojisGrid: false,
    },
  },
  setUser: mockSetUser,
} as unknown as UserContextType;

const FakeSendEmojiButton = <Button data-testid="send-emoji-button" />;

describe('EmojiGrid', () => {
  beforeEach(() => {
    mockUseUserContext.mockReturnValue(defaultUserContext);
    mockSendEmojiButton.mockReturnValue(FakeSendEmojiButton);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the grid', () => {
    render(<EmojiGrid />);
    expect(screen.queryByTestId('emoji-grid-toggle')).toBeVisible();
  });

  it('when the emoji grid preference on mobile is open, emojis are displayed', () => {
    const openedEmojiGridUserContext = {
      ...defaultUserContext,
      user: {
        defaultSettings: {
          openEmojisGrid: true,
        },
      },
    } as unknown as UserContextType;
    mockUseUserContext.mockReturnValue(openedEmojiGridUserContext);
    mockUseIsSmallViewport.mockReturnValue(true);

    render(<EmojiGrid />);

    expect(screen.queryByTestId('send-emoji-button')).toBeVisible();
  });
});
