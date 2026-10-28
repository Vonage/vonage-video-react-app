import { describe, expect, it, vi, beforeEach, Mock, afterAll } from 'vitest';
import { render as renderBase, screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { ReactElement } from 'react';
import useSpeakingDetector from '@hooks/useSpeakingDetector';
import isReportIssueEnabled from '@utils/isReportIssueEnabled';
import useToolbarButtons, {
  UseToolbarButtons,
  UseToolbarButtonsProps,
} from '@hooks/useToolbarButtons';
import { makeTestProvider, providers } from '@test/providers';
import { env } from '../../../env';
import Toolbar, { ToolbarProps, CaptionsState } from './Toolbar';
import { testIds as advancedSettingsButtonTestIds } from '../AdvancedSettingsButton/AdvancedSettingsButton';
import { testIds as archivingButtonTestIds } from '../ArchivingButton/ArchivingButton';
import { testIds as postCallTranscriptionButtonTestIds } from '../PostCallTranscriptionButton/PostCallTranscriptionButton';
import { testIds as captionsButtonTestIds } from '../CaptionsButton/CaptionsButton';
import { testIds as chatButtonTestIds } from '../ChatButton/ChatButton';
import { testIds as emojiGridButtonTestIds } from '../EmojiGridButton/EmojiGridButton';
import { testIds as participantListButtonTestIds } from '../ParticipantListButton/ParticipantListButton';
import { testIds as reportIssueButtonTestIds } from '../ReportIssueButton/ReportIssueButton';
import { testIds as screenSharingButtonTestIds } from '../../ScreenSharingButton/ScreenSharingButton';
import { testIds as toolbarOverflowButtonTestIds } from '../ToolbarOverflowButton/ToolbarOverflowButton';

const mockedRoomName = { roomName: 'test-room-name' };

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useParams: () => mockedRoomName,
}));

vi.mock('@hooks/useSpeakingDetector');
vi.mock('@utils/isReportIssueEnabled');
vi.mock('@hooks/useToolbarButtons');

const mockUseSpeakingDetector = useSpeakingDetector as Mock<[], boolean>;
const mockIsReportIssueEnabled = isReportIssueEnabled as Mock<[], boolean>;
const mockUseToolbarButtons = useToolbarButtons as Mock<
  [UseToolbarButtonsProps],
  UseToolbarButtons
>;

describe('Toolbar', () => {
  beforeEach(() => {
    env.reset();
    (useLocation as Mock).mockReturnValue({
      state: mockedRoomName,
    });
    mockUseSpeakingDetector.mockReturnValue(false);
    mockIsReportIssueEnabled.mockReturnValue(false);
    mockUseToolbarButtons.mockImplementation(
      ({ numberOfToolbarButtons, rightPanelButtonCount }: UseToolbarButtonsProps) => {
        const renderedToolbarButtons: UseToolbarButtons = {
          displayTimeRoomName: true,
          centerButtonLimit: numberOfToolbarButtons - rightPanelButtonCount,
          rightButtonLimit: numberOfToolbarButtons,
        };
        return renderedToolbarButtons;
      }
    );
  });

  afterAll(() => {
    env.reset();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  const defaultProps: ToolbarProps = {
    toggleShareScreen: vi.fn(),
    isSharingScreen: false,
    rightPanelActiveTab: 'closed',
    toggleParticipantList: vi.fn(),
    toggleChat: vi.fn(),
    toggleReportIssue: vi.fn(),
    toggleBackgroundEffects: vi.fn(),
    participantCount: 0,
    captionsState: {
      isUserCaptionsEnabled: false,
      setIsUserCaptionsEnabled: vi.fn(),
      setCaptionsErrorResponse: vi.fn(),
    } as CaptionsState,
  };

  it('does not render the Report Issue button if it is configured to be disabled', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.queryByTestId(reportIssueButtonTestIds.button)).not.toBeInTheDocument();
  });

  it('renders the Report Issue button if it is configured to be enabled', () => {
    mockIsReportIssueEnabled.mockReturnValue(true);
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByTestId(reportIssueButtonTestIds.button)).toBeInTheDocument();
  });

  it('on a small viewport, displays the ToolbarOverflowButton button', () => {
    mockUseToolbarButtons.mockReturnValue({
      displayTimeRoomName: false,
      centerButtonLimit: 0,
      rightButtonLimit: 0,
    });

    render(<Toolbar {...defaultProps} />);

    expect(screen.queryByTestId(toolbarOverflowButtonTestIds.button)).toBeVisible();

    expect(screen.queryByTestId(archivingButtonTestIds.button)).not.toBeVisible();
    expect(screen.queryByTestId(screenSharingButtonTestIds.button)).not.toBeVisible();
    expect(screen.queryByTestId(archivingButtonTestIds.button)).not.toBeVisible();
    expect(screen.queryByTestId(emojiGridButtonTestIds.button)).not.toBeVisible();
  });

  it('on a normal viewport, displays all of the toolbar buttons', () => {
    env.partialUpdate({ MEETING_ROOM_ALLOW_ADVANCED_SETTINGS: true });
    render(
      <Toolbar
        {...{
          ...defaultProps,
          captionsState: {
            ...defaultProps.captionsState,
            isUserCaptionsEnabled: true,
          },
        }}
      />
    );
    expect(screen.queryByTestId(archivingButtonTestIds.button)).toBeVisible();
    expect(screen.queryByTestId(advancedSettingsButtonTestIds.button)).toBeVisible();
    expect(screen.queryByTestId(screenSharingButtonTestIds.button)).toBeVisible();
    expect(screen.queryByTestId(emojiGridButtonTestIds.button)).toBeVisible();
    expect(screen.queryByTestId(captionsButtonTestIds.button)).toBeVisible();
  });

  it('does not render advanced settings when the flag is disabled', () => {
    env.partialUpdate({ MEETING_ROOM_ALLOW_ADVANCED_SETTINGS: false });
    render(<Toolbar {...defaultProps} />);

    expect(screen.queryByTestId(advancedSettingsButtonTestIds.button)).not.toBeInTheDocument();
  });

  it('splits the buttons between the toolbar and the overflow menu without repeating or losing any', () => {
    mockUseToolbarButtons.mockReturnValue({
      displayTimeRoomName: false,
      centerButtonLimit: 3,
      rightButtonLimit: 3,
    });

    render(<Toolbar {...defaultProps} />);

    expect(screen.getAllByTestId(emojiGridButtonTestIds.button)).toHaveLength(1);
    expect(screen.getAllByTestId(captionsButtonTestIds.button)).toHaveLength(1);
    expect(screen.getAllByTestId(screenSharingButtonTestIds.button)).toHaveLength(1);
    expect(screen.getAllByTestId(archivingButtonTestIds.button)).toHaveLength(1);
    expect(screen.getAllByTestId(postCallTranscriptionButtonTestIds.button)).toHaveLength(1);
    expect(screen.getAllByTestId(chatButtonTestIds.button)).toHaveLength(1);
  });

  it('does not render the buttons whose feature flags are disabled', () => {
    env.partialUpdate({
      ALLOW_SCREEN_SHARE: false,
      ALLOW_EMOJIS: false,
      ALLOW_CAPTIONS: false,
      ALLOW_ARCHIVING: false,
      ALLOW_POST_CALL_TRANSCRIPTION: false,
      SHOW_PARTICIPANT_LIST: false,
      ALLOW_CHAT: false,
    });

    render(<Toolbar {...defaultProps} />);

    expect(screen.queryByTestId(screenSharingButtonTestIds.button)).not.toBeInTheDocument();
    expect(screen.queryByTestId(emojiGridButtonTestIds.button)).not.toBeInTheDocument();
    expect(screen.queryByTestId(captionsButtonTestIds.button)).not.toBeInTheDocument();
    expect(screen.queryByTestId(archivingButtonTestIds.button)).not.toBeInTheDocument();
    expect(screen.queryByTestId(postCallTranscriptionButtonTestIds.button)).not.toBeInTheDocument();
    expect(screen.queryByTestId(participantListButtonTestIds.button)).not.toBeInTheDocument();
    expect(screen.queryByTestId(chatButtonTestIds.button)).not.toBeInTheDocument();
  });

  it('renders the Mini Mode button only on desktop browsers that support Document Picture-in-Picture', () => {
    const unsupported = render(<Toolbar {...defaultProps} />);
    expect(screen.queryByTestId('mini-mode-button')).not.toBeInTheDocument();
    unsupported.unmount();

    vi.stubGlobal('documentPictureInPicture', { requestWindow: vi.fn() });
    const desktop = render(<Toolbar {...defaultProps} />);
    expect(screen.getByTestId('mini-mode-button')).toBeInTheDocument();
    desktop.unmount();

    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
      'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36'
    );
    render(<Toolbar {...defaultProps} />);
    expect(screen.queryByTestId('mini-mode-button')).not.toBeInTheDocument();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('does not reserve toolbar space for buttons whose feature flags are disabled', () => {
    env.partialUpdate({ ALLOW_CHAT: false, SHOW_PARTICIPANT_LIST: false });

    render(<Toolbar {...defaultProps} />);

    expect(mockUseToolbarButtons).toHaveBeenLastCalledWith(
      expect.objectContaining({ numberOfToolbarButtons: 6 })
    );
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime, providers.miniMode]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
