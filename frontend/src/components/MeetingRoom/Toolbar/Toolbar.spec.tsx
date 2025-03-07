import { describe, expect, it, vi, beforeEach, Mock, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import useSpeakingDetector from '../../../hooks/useSpeakingDetector';
import Toolbar, { ToolbarProps } from './Toolbar';
import isReportIssueEnabled from '../../../utils/isReportIssueEnabled';
import useToolbarCount from '../../../hooks/useToolbarCount';

const mockedRoomName = { roomName: 'test-room-name' };

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useParams: () => mockedRoomName,
}));

vi.mock('../../../hooks/useSpeakingDetector');
vi.mock('../../../hooks/useToolbarCount');
vi.mock('../../../utils/isReportIssueEnabled');

const mockUseSpeakingDetector = useSpeakingDetector as Mock<[], boolean>;
const mockUseToolbarCount = useToolbarCount as Mock<[], number>;
const mockIsReportIssueEnabled = isReportIssueEnabled as Mock<[], boolean>;

describe('Toolbar', () => {
  beforeEach(() => {
    (useLocation as Mock).mockReturnValue({
      state: mockedRoomName,
    });
    mockUseSpeakingDetector.mockReturnValue(false);
    mockUseToolbarCount.mockReturnValue(9);
    mockIsReportIssueEnabled.mockReturnValue(false);
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
    participantCount: 0,
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
    mockUseToolbarCount.mockReturnValue(0);

    render(<Toolbar {...defaultProps} />);

    expect(screen.queryByTestId('hidden-toolbar-items')).toBeVisible();

    expect(screen.queryByTestId('archiving-button')).not.toBeVisible();
    expect(screen.queryByTestId('screensharing-button')).not.toBeVisible();
    expect(screen.queryByTestId('archiving-button')).not.toBeVisible();
    expect(screen.queryByTestId('emoji-grid-button')).not.toBeVisible();
  });

  it('on a normal viewport, displays all of the toolbar buttons', () => {
    render(<Toolbar {...defaultProps} />);

    expect(screen.queryByTestId('archiving-button')).toBeVisible();
    expect(screen.queryByTestId('screensharing-button')).toBeVisible();
    expect(screen.queryByTestId('archiving-button')).toBeVisible();
    expect(screen.queryByTestId('emoji-grid-button')).toBeVisible();
  });
});
