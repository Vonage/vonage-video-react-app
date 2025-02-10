import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { Button } from '@mui/material';
import EmojiGrid from './EmojiGrid';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import SendEmojiButton from '../SendEmojiButton';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';

vi.mock('../../../hooks/useSessionContext');
vi.mock('../../../hooks/useIsSmallViewport');
vi.mock('../SendEmojiButton');
vi.mock('../../../utils/emojis', () => ({
  default: { FAVORITE: '🦧' },
}));

const mockUseIsSmallViewport = useIsSmallViewport as Mock<[], boolean>;
const mockSendEmojiButton = SendEmojiButton as Mock<[], ReactElement>;
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const mockSetOpenEmojiGrid = vi.fn();

const FakeSendEmojiButton = <Button data-testid="send-emoji-button" />;
const fakeUseSessionContext = {
  openEmojiGrid: true,
  setOpenEmojiGrid: mockSetOpenEmojiGrid,
} as unknown as SessionContextType;

describe('EmojiGrid', () => {
  beforeEach(() => {
    mockSendEmojiButton.mockReturnValue(FakeSendEmojiButton);
    mockUseIsSmallViewport.mockReturnValue(false);
    mockUseSessionContext.mockReturnValue(fakeUseSessionContext);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the grid', () => {
    render(<EmojiGrid />);
    expect(screen.queryByTestId('emoji-grid-toggle')).toBeVisible();
  });

  it('toggling the emoji grid shows and hides the emoji(s)', () => {
    render(<EmojiGrid />);

    act(() => {
      screen.getByRole('button').click();
    });

    expect(screen.queryByTestId('send-emoji-button')).toBeVisible();

    act(() => {
      screen.getByTestId('emoji-grid-toggle').click();
    });

    expect(screen.queryByTestId('send-emoji-button')).not.toBeVisible();
  });

  it('when the emoji grid preference on mobile is open, emojis are displayed', () => {
    mockUseIsSmallViewport.mockReturnValue(true);

    render(<EmojiGrid />);

    expect(screen.queryByTestId('send-emoji-button')).toBeVisible();
  });
});
