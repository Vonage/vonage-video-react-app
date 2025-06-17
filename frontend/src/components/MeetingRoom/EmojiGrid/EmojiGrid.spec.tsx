import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReactElement, useRef, useState } from 'react';
import * as mui from '@mui/material';
import EmojiGrid from './EmojiGrid';
import SendEmojiButton from '../SendEmojiButton';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof mui>('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});
vi.mock('../SendEmojiButton');
vi.mock('../../../utils/emojis', () => ({
  default: { FAVORITE: '🦧' },
}));

const mockSendEmojiButton = SendEmojiButton as Mock<[], ReactElement>;

const FakeSendEmojiButton = <mui.Button data-testid="send-emoji-button" />;
const TestComponent = ({
  defaultOpenEmojiGrid = false,
}: {
  defaultOpenEmojiGrid?: boolean;
}): ReactElement => {
  const [isEmojiGridOpen, setIsEmojiGridOpen] = useState<boolean>(defaultOpenEmojiGrid);
  const anchorRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <mui.Button type="button" ref={anchorRef} />
      <EmojiGrid
        anchorRef={anchorRef}
        isEmojiGridOpen={isEmojiGridOpen}
        setIsEmojiGridOpen={setIsEmojiGridOpen}
        isParentOpen
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
      (mui.useMediaQuery as Mock).mockReturnValue(false);
    });

    it('displays emoji grid when open', () => {
      render(<TestComponent defaultOpenEmojiGrid />);

      expect(screen.getByTestId('send-emoji-button')).toBeVisible();
    });

    it('displays nothing when closed', () => {
      render(<TestComponent defaultOpenEmojiGrid={false} />);

      expect(screen.queryByTestId('send-emoji-button')).not.toBeInTheDocument();
    });
  });

  describe('on mobile', () => {
    beforeEach(() => {
      (mui.useMediaQuery as Mock).mockReturnValue(true);
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
