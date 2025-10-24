import { act, render as renderBase, RenderOptions, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi, Mock } from 'vitest';
import { FC, PropsWithChildren, ReactElement, useState } from 'react';
import * as mui from '@mui/material';
import AppConfigStore from '@Context/ConfigProvider/AppConfigStore';
import { ConfigProviderBase } from '@Context/ConfigProvider/ConfigProvider';
import EmojiGridButton from './EmojiGridButton';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof mui>('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
  };
});
vi.mock('../../../utils/emojis', () => ({
  default: { FAVORITE: '🦧' },
}));

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
    (mui.useMediaQuery as Mock).mockReturnValue(false);
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

  it('is not rendered when allowEmojis is false', () => {
    const configStore = new AppConfigStore({
      meetingRoomSettings: {
        allowEmojis: false,
      },
    });
    render(<TestComponent />, { wrapper: makeProvidersWrapper({ configStore }) });
    expect(screen.queryByTestId('emoji-grid-button')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement, options?: RenderOptions) {
  const Wrapper = options?.wrapper ?? makeProvidersWrapper();
  return renderBase(ui, { ...options, wrapper: Wrapper });
}

function makeProvidersWrapper(providers?: { configStore?: AppConfigStore }) {
  const configStore =
    providers?.configStore ??
    new AppConfigStore({
      meetingRoomSettings: {
        allowEmojis: true,
      },
    });

  const Wrapper: FC<PropsWithChildren> = ({ children }) => (
    <ConfigProviderBase value={configStore}>{children}</ConfigProviderBase>
  );

  return Wrapper;
}
