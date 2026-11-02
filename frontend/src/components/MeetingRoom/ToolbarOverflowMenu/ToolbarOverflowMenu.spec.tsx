import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render as renderBase, screen, within } from '@testing-library/react';
import { ReactElement, useRef } from 'react';
import userEvent from '@testing-library/user-event';
import { isMobile } from '@web/platform';
import isReportIssueEnabled from '@utils/isReportIssueEnabled';
import { makeTestProvider, providers, ProviderOptions } from '@test/providers';
import { env } from '../../../env';
import ToolbarOverflowMenu, {
  CaptionsState,
  testIds as toolbarOverflowMenuTestIds,
} from './ToolbarOverflowMenu';
import Button from '@mui/material/Button';
import { testIds as advancedSettingsButtonTestIds } from '../AdvancedSettingsButton/AdvancedSettingsButton';
import { testIds as archivingButtonTestIds } from '../ArchivingButton/ArchivingButton';
import { testIds as captionsButtonTestIds } from '../CaptionsButton/CaptionsButton';
import { testIds as chatButtonTestIds } from '../ChatButton/ChatButton';
import { testIds as emojiGridButtonTestIds } from '../EmojiGridButton/EmojiGridButton';
import { testIds as layoutButtonTestIds } from '../LayoutButton/LayoutButton';
import { testIds as participantListButtonTestIds } from '../ParticipantListButton/ParticipantListButton';
import { testIds as reportIssueButtonTestIds } from '../ReportIssueButton/ReportIssueButton';
import { testIds as screenSharingButtonTestIds } from '../../ScreenSharingButton/ScreenSharingButton';

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

    expect(screen.getByTestId(toolbarOverflowMenuTestIds.menu)).toBeVisible();
  });

  it('is not shown when closed', () => {
    render(<TestComponent />);

    expect(screen.queryByTestId(toolbarOverflowMenuTestIds.menu)).not.toBeVisible();
  });

  it('renders all the available buttons including the Report Issue button if enabled', () => {
    mockIsReportIssueEnabled.mockReturnValue(true);
    env.partialUpdate({ MEETING_ROOM_ALLOW_ADVANCED_SETTINGS: true });
    render(<TestComponent defaultOpen />);

    expect(screen.getByTestId(screenSharingButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(layoutButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(archivingButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(captionsButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(emojiGridButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(advancedSettingsButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(reportIssueButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(participantListButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(chatButtonTestIds.button)).toBeVisible();
  });

  it('does not render Report Issue button in overflow menu if it was disabled', () => {
    env.partialUpdate({ MEETING_ROOM_ALLOW_ADVANCED_SETTINGS: false });
    render(<TestComponent defaultOpen />);

    expect(screen.getByTestId(screenSharingButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(layoutButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(archivingButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(captionsButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(emojiGridButtonTestIds.button)).toBeVisible();
    expect(screen.queryByTestId(advancedSettingsButtonTestIds.button)).not.toBeInTheDocument();
    expect(screen.queryByTestId(reportIssueButtonTestIds.button)).not.toBeInTheDocument();
    expect(screen.getByTestId(participantListButtonTestIds.button)).toBeVisible();
    expect(screen.getByTestId(chatButtonTestIds.button)).toBeVisible();
  });

  it('offers only the enabled features and opens the chosen one', async () => {
    env.partialUpdate({
      ALLOW_SCREEN_SHARE: false,
      ALLOW_EMOJIS: false,
      ALLOW_CAPTIONS: false,
      ALLOW_ARCHIVING: false,
      ALLOW_POST_CALL_TRANSCRIPTION: false,
      SHOW_PARTICIPANT_LIST: false,
    });
    const mockToggleChat = vi.fn();
    const user = userEvent.setup();

    render(<TestComponent defaultOpen />, {
      sessionContext: {
        __interceptor: (context) => {
          if (context) {
            context.toggleChat = mockToggleChat;
          }
        },
      },
    });

    const overflowMenu = screen.getByTestId(toolbarOverflowMenuTestIds.menu);
    expect(within(overflowMenu).getAllByRole('button')).toEqual([
      screen.getByTestId(layoutButtonTestIds.button),
      screen.getByTestId(chatButtonTestIds.button),
    ]);

    await user.click(screen.getByTestId(chatButtonTestIds.button));

    expect(mockToggleChat).toHaveBeenCalledTimes(1);
    expect(mockHandleClickAway).toHaveBeenCalled();
  });

  it('closes the overflow menu after changing the layout', async () => {
    const user = userEvent.setup();

    render(<TestComponent defaultOpen />);

    await user.click(screen.getByTestId(layoutButtonTestIds.button));

    expect(mockHandleClickAway).toHaveBeenCalled();
  });

  describe('ScreenSharingButton', () => {
    it('is not rendered for mobile devices', () => {
      vi.mocked(isMobile).mockImplementation(() => true);
      render(<TestComponent defaultOpen />);

      expect(screen.queryByTestId(screenSharingButtonTestIds.button)).not.toBeInTheDocument();
    });

    it('is rendered for desktop devices', () => {
      render(<TestComponent defaultOpen />);

      expect(screen.getByTestId(screenSharingButtonTestIds.button)).toBeVisible();
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
