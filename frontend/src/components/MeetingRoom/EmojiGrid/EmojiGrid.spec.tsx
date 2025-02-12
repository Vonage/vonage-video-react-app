import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ReactElement, useState } from 'react';
import { Button } from '@mui/material';
import EmojiGrid from './EmojiGrid';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import SendEmojiButton from '../SendEmojiButton';

vi.mock('../../../hooks/useIsSmallViewport');
vi.mock('../SendEmojiButton');
vi.mock('../../../utils/emojis', () => ({
  default: { FAVORITE: '🦧' },
}));

const mockUseIsSmallViewport = useIsSmallViewport as Mock<[], boolean>;
const mockSendEmojiButton = SendEmojiButton as Mock<[], ReactElement>;

const FakeSendEmojiButton = <Button data-testid="send-emoji-button" />;
const TestComponent = ({
  defaultOpenEmojiGrid = false,
}: {
  defaultOpenEmojiGrid?: boolean;
}): ReactElement => {
  const [openEmojiGrid, setOpenEmojiGrid] = useState<boolean>(defaultOpenEmojiGrid);

  return (
    <div>
      <Button data-testid="clicked-away" type="button" />
      <EmojiGrid openEmojiGrid={openEmojiGrid} setOpenEmojiGrid={setOpenEmojiGrid} />
    </div>
  );
};

describe('EmojiGrid', () => {
  beforeEach(() => {
    mockSendEmojiButton.mockReturnValue(FakeSendEmojiButton);
    mockUseIsSmallViewport.mockReturnValue(false);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('renders the emoji grid button', () => {
    render(<TestComponent />);
    expect(screen.queryByTestId('emoji-grid-toggle')).toBeVisible();
  });

  it('toggling the emoji grid shows and hides the emoji(s)', () => {
    render(<TestComponent />);

    act(() => {
      screen.getByTestId('emoji-grid-toggle').click();
    });

    expect(screen.queryByTestId('send-emoji-button')).toBeVisible();

    act(() => {
      screen.getByTestId('emoji-grid-toggle').click();
    });

    expect(screen.queryByTestId('send-emoji-button')).not.toBeVisible();
  });

  it('on desktop, grid is closed by default', () => {
    render(<TestComponent defaultOpenEmojiGrid={false} />);

    expect(screen.queryByTestId('send-emoji-button')).not.toBeInTheDocument();
  });

  it('on mobile, grid is open by default', () => {
    render(<TestComponent defaultOpenEmojiGrid />);

    expect(screen.queryByTestId('send-emoji-button')).toBeVisible();
  });
});
