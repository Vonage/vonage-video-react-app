import { describe, expect, it, vi, beforeEach, Mock, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import useSpeakingDetector from '../../../hooks/useSpeakingDetector';
import Toolbar, { ToolbarProps, BackendFeatureState } from './Toolbar';
import isReportIssueEnabled from '../../../utils/isReportIssueEnabled';
import useToolbarButtons, {
  UseToolbarButtons,
  UseToolbarButtonsProps,
} from '../../../hooks/useToolbarButtons';
import { RIGHT_PANEL_BUTTON_COUNT } from '../../../utils/constants';

const mockedRoomName = { roomName: 'test-room-name' };

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useParams: () => mockedRoomName,
}));

vi.mock('../../../hooks/useSpeakingDetector');
vi.mock('../../../utils/isReportIssueEnabled');
vi.mock('../../../hooks/useToolbarButtons');

const mockUseSpeakingDetector = useSpeakingDetector as Mock<[], boolean>;
const mockIsReportIssueEnabled = isReportIssueEnabled as Mock<[], boolean>;
const mockUseToolbarButtons = useToolbarButtons as Mock<
  [UseToolbarButtonsProps],
  UseToolbarButtons
>;

describe('Toolbar', () => {
  beforeEach(() => {
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
    backendFeatureState: {
      isUserCaptionsEnabled: false,
      setIsUserCaptionsEnabled: vi.fn(),
      setEnableActionErrorResponse: vi.fn(),
    } as BackendFeatureState,
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
    render(
      <Toolbar
        {...{
          ...defaultProps,
          backendFeatureState: {
            ...defaultProps.backendFeatureState,
            isUserCaptionsEnabled: true,
          },
        }}
      />
    );
    expect(screen.queryByTestId('archiving-button')).toBeVisible();
    expect(screen.queryByTestId('screensharing-button')).toBeVisible();
    expect(screen.queryByTestId('emoji-grid-button')).toBeVisible();
    expect(screen.queryByTestId('captions-button')).toBeVisible();
  });
});
