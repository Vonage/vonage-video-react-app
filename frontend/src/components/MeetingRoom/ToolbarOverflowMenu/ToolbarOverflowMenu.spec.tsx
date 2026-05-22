import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import { ReactElement, useRef } from 'react';
import userEvent from '@testing-library/user-event';
import { isMobile } from '@web/platform';
import isReportIssueEnabled from '@utils/isReportIssueEnabled';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import { env } from '../../../env';
import ToolbarOverflowMenu, { CaptionsState } from './ToolbarOverflowMenu';
import Button from '@mui/material/Button';

vi.mock('@hooks/useRoomName');
vi.mock('@web/platform');
vi.mock('@utils/isReportIssueEnabled');

const mockOpenEmojiGrid = vi.fn();
const mockHandleClickAway = vi.fn();
const mockIsReportIssueEnabled = isReportIssueEnabled as Mock<[], boolean>;

const mockCaptionsState = {
  isUserCaptionsEnabled: false,
  setIsUserCaptionsEnabled: vi.fn(),
  setCaptionsErrorResponse: vi.fn(),
} as CaptionsState;

const TestComponent = ({ defaultOpen = false }: { defaultOpen?: boolean }) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <Button ref={anchorRef} />
      <ToolbarOverflowMenu
        isOpen={defaultOpen}
        isEmojiGridOpen
        setIsEmojiGridOpen={mockOpenEmojiGrid}
        closeMenu={mockHandleClickAway}
        toggleShareScreen={vi.fn()}
        isSharingScreen={false}
        toolbarButtonsCount={0}
        captionsState={mockCaptionsState}
      />
    </>
  );
};

describe('ToolbarOverflowMenu', () => {
  beforeEach(() => {
    env.reset();
    vi.mocked(isMobile).mockImplementation(() => false);
    mockIsReportIssueEnabled.mockReturnValue(false);
  });

  afterEach(() => {
    env.reset();
    vi.resetAllMocks();
  });

  it('is shown when open', () => {
    render(<TestComponent defaultOpen />);

    expect(screen.getByTestId('toolbar-overflow-menu')).toBeVisible();
  });

  it('is not shown when closed', () => {
    render(<TestComponent />);

    expect(screen.queryByTestId('toolbar-overflow-menu')).not.toBeVisible();
  });

  it('renders all the available buttons including the Report Issue button if enabled', () => {
    mockIsReportIssueEnabled.mockReturnValue(true);
    env.partialUpdate({ MEETING_ROOM_ALLOW_ADVANCED_SETTINGS: true });
    render(<TestComponent defaultOpen />);

    expect(screen.getByTestId('screensharing-button')).toBeVisible();
    expect(screen.getByTestId('layout-button')).toBeVisible();
    expect(screen.getByTestId('archiving-button')).toBeVisible();
    expect(screen.getByTestId('captions-button')).toBeVisible();
    expect(screen.getByTestId('emoji-grid-button')).toBeVisible();
    expect(screen.getByTestId('advanced-settings-button')).toBeVisible();
    expect(screen.getByTestId('report-issue-button')).toBeVisible();
    expect(screen.getByTestId('participant-list-button')).toBeVisible();
    expect(screen.getByTestId('chat-button')).toBeVisible();
  });

  it('does not render Report Issue button in overflow menu if it was disabled', () => {
    env.partialUpdate({ MEETING_ROOM_ALLOW_ADVANCED_SETTINGS: false });
    render(<TestComponent defaultOpen />);

    expect(screen.getByTestId('screensharing-button')).toBeVisible();
    expect(screen.getByTestId('layout-button')).toBeVisible();
    expect(screen.getByTestId('archiving-button')).toBeVisible();
    expect(screen.getByTestId('captions-button')).toBeVisible();
    expect(screen.getByTestId('emoji-grid-button')).toBeVisible();
    expect(screen.queryByTestId('advanced-settings-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('report-issue-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('participant-list-button')).toBeVisible();
    expect(screen.getByTestId('chat-button')).toBeVisible();
  });

  it('closes the overflow menu after changing the layout', async () => {
    const user = userEvent.setup();

    render(<TestComponent defaultOpen />);

    await user.click(screen.getByTestId('layout-button'));

    expect(mockHandleClickAway).toHaveBeenCalled();
  });

  describe('ScreenSharingButton', () => {
    it('is not rendered for mobile devices', () => {
      vi.mocked(isMobile).mockImplementation(() => true);
      render(<TestComponent defaultOpen />);

      expect(screen.queryByTestId('screensharing-button')).not.toBeInTheDocument();
    });

    it('is rendered for desktop devices', () => {
      render(<TestComponent defaultOpen />);

      expect(screen.getByTestId('screensharing-button')).toBeVisible();
    });
  });
});

type RenderOptions = {
  sessionContext?: ProviderOptions['SessionContext'];
  userContext?: ProviderOptions['UserContext'];
};

function render(ui: ReactElement, { sessionContext, userContext }: RenderOptions = {}) {
  const { wrapper, ...context } = makeTestProvider(
    [providers.user, providers.session, providers.runtime],
    {
      sessionContext,
      userContext,
      runtimeContext: undefined,
    }
  );

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
