import { describe, expect, it, vi, beforeEach, Mock, afterAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import useSpeakingDetector from '../../../hooks/useSpeakingDetector';
import useIsSmallViewport from '../../../hooks/useIsSmallViewport';
import displayOnDesktop from '../../../utils/displayOnDesktop';
import Toolbar, { ToolbarProps } from './Toolbar';

const mockedRoomName = { roomName: 'test-room-name' };

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useParams: () => mockedRoomName,
}));

vi.mock('../../../hooks/useSpeakingDetector');
vi.mock('../../../hooks/useIsSmallViewport');
vi.mock('../../../utils/displayOnDesktop');

const mockUseSpeakingDetector = useSpeakingDetector as Mock<[], boolean>;
const mockUseIsSmallViewport = useIsSmallViewport as Mock<[], boolean>;
const mockDisplayOnDesktop = displayOnDesktop as Mock<[], '' | 'md:inline'>;

describe('Toolbar', () => {
  beforeEach(() => {
    (useLocation as Mock).mockReturnValue({
      state: mockedRoomName,
    });
    mockUseSpeakingDetector.mockReturnValue(false);
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
    vi.stubEnv('VITE_ENABLE_REPORT_ISSUE', 'false');
    render(<Toolbar {...defaultProps} />);
    expect(screen.queryByTestId('report-issue-button')).not.toBeInTheDocument();
  });

  it('does not render the Report Issue button if the configuration is not defined', () => {
    render(<Toolbar {...defaultProps} />);
    expect(screen.queryByTestId('report-issue-button')).not.toBeInTheDocument();
  });

  it('renders the Report Issue button if it is configured to be enabled', () => {
    vi.stubEnv('VITE_ENABLE_REPORT_ISSUE', 'true');
    render(<Toolbar {...defaultProps} />);
    expect(screen.getByTestId('report-issue-button')).toBeInTheDocument();
  });

  it('on a small viewport, displays the HiddenToolbarItems button', () => {
    mockUseIsSmallViewport.mockReturnValue(true);
    mockDisplayOnDesktop.mockReturnValue('');

    render(<Toolbar {...defaultProps} />);

    expect(screen.queryByTestId('archiving-toggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('screensharing-toggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('archiving-toggle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('emoji-grid-toggle')).not.toBeInTheDocument();
  });

  it('on a normal viewport, displays the all of the toolbar buttons', () => {
    mockUseIsSmallViewport.mockReturnValue(false);
    mockDisplayOnDesktop.mockReturnValue('md:inline');

    render(<Toolbar {...defaultProps} />);

    expect(screen.queryByTestId('archiving-toggle')).toBeVisible();
    expect(screen.queryByTestId('screensharing-toggle')).toBeVisible();
    expect(screen.queryByTestId('archiving-toggle')).toBeVisible();
    expect(screen.queryByTestId('emoji-grid-toggle')).toBeVisible();
  });
});
