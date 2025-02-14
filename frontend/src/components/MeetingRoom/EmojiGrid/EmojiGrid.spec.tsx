import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactElement, useRef, useState } from 'react';
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
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <Button type="button" ref={anchorRef} />
      <EmojiGrid
        anchorRef={anchorRef}
        openEmojiGrid={openEmojiGrid}
        setOpenEmojiGrid={setOpenEmojiGrid}
      />
    </>
  );
};

describe('EmojiGrid', () => {
  beforeEach(() => {
    mockSendEmojiButton.mockReturnValue(FakeSendEmojiButton);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('on desktop', () => {
    beforeEach(() => {
      mockUseIsSmallViewport.mockReturnValue(false);
    });

    it('displays emoji grid when open', () => {
      render(<TestComponent defaultOpenEmojiGrid />);

      expect(screen.queryByTestId('send-emoji-button')).toBeVisible();
    });

    it('displays nothing when closed', () => {
      render(<TestComponent defaultOpenEmojiGrid={false} />);

      expect(screen.queryByTestId('send-emoji-button')).not.toBeInTheDocument();
    });
  });

  describe('on mobile', () => {
    beforeEach(() => {
      mockUseIsSmallViewport.mockReturnValue(true);
    });

    it('displays emoji grid when open', () => {
      render(<TestComponent defaultOpenEmojiGrid />);

      expect(screen.queryByTestId('send-emoji-button')).toBeVisible();
    });

    it('displays nothing when closed', () => {
      render(<TestComponent defaultOpenEmojiGrid={false} />);

      expect(screen.queryByTestId('send-emoji-button')).not.toBeVisible();
    });
  });
});
