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
import { RIGHT_PANEL_BUTTON_COUNT } from '@utils/constants';
import { makeTestProvider, providers } from '@test/providers';
import { env } from '../../../env';
import Toolbar, { ToolbarProps, CaptionsState } from './Toolbar';

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
      ({ numberOfToolbarButtons }: UseToolbarButtonsProps) => {
        const renderedToolbarButtons: UseToolbarButtons = {
          displayTimeRoomName: true,
          centerButtonLimit: numberOfToolbarButtons - RIGHT_PANEL_BUTTON_COUNT,
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
    expect(screen.queryByTestId('report-issue-button')).not.toBeInTheDocument();
  });

  it('renders the Report Issue button if it is configured to be enabled', () => {
    mockIsReportIssueEnabled.mockReturnValue(true);
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByTestId('report-issue-button')).toBeInTheDocument();
  });

  it('on a small viewport, displays the ToolbarOverflowButton button', () => {
    mockUseToolbarButtons.mockReturnValue({
      displayTimeRoomName: false,
      centerButtonLimit: 0,
      rightButtonLimit: 0,
    });

    render(<Toolbar {...defaultProps} />);

    expect(screen.queryByTestId('hidden-toolbar-items')).toBeVisible();

    expect(screen.queryByTestId('archiving-button')).not.toBeVisible();
    expect(screen.queryByTestId('screensharing-button')).not.toBeVisible();
    expect(screen.queryByTestId('archiving-button')).not.toBeVisible();
    expect(screen.queryByTestId('emoji-grid-button')).not.toBeVisible();
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
    expect(screen.queryByTestId('archiving-button')).toBeVisible();
    expect(screen.queryByTestId('advanced-settings-button')).toBeVisible();
    expect(screen.queryByTestId('screensharing-button')).toBeVisible();
    expect(screen.queryByTestId('emoji-grid-button')).toBeVisible();
    expect(screen.queryByTestId('captions-button')).toBeVisible();
  });

  it('does not render advanced settings when the flag is disabled', () => {
    env.partialUpdate({ MEETING_ROOM_ALLOW_ADVANCED_SETTINGS: false });
    render(<Toolbar {...defaultProps} />);

    expect(screen.queryByTestId('advanced-settings-button')).not.toBeInTheDocument();
  });
});

function render(ui: ReactElement) {
  const { wrapper, ...context } = makeTestProvider([providers.runtime]);

  return {
    ...context,
    ...renderBase(ui, { wrapper }),
  };
}
