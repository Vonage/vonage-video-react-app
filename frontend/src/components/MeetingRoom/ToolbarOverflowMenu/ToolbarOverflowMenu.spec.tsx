import { afterEach, beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { Button } from '@mui/material';
import ToolbarOverflowMenu, { CaptionsState } from './ToolbarOverflowMenu';
import * as util from '../../../utils/util';
import isReportIssueEnabled from '../../../utils/isReportIssueEnabled';

vi.mock('../../../hooks/useSessionContext', () => ({
  default: () => ({
    subscriberWrappers: [],
  }),
}));
vi.mock('../../../hooks/useRoomName');
vi.mock('../../../utils/util', () => ({ isMobile: vi.fn() }));
vi.mock('../../../utils/isReportIssueEnabled');

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
    (util.isMobile as Mock).mockImplementation(() => false);
    mockIsReportIssueEnabled.mockReturnValue(false);
  });

  afterEach(() => {
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
    render(<TestComponent defaultOpen />);

    expect(screen.getByTestId('screensharing-button')).toBeVisible();
    expect(screen.getByTestId('layout-button')).toBeVisible();
    expect(screen.getByTestId('archiving-button')).toBeVisible();
    expect(screen.getByTestId('captions-button')).toBeVisible();
    expect(screen.getByTestId('emoji-grid-button')).toBeVisible();
    expect(screen.getByTestId('report-issue-button')).toBeVisible();
    expect(screen.getByTestId('participant-list-button')).toBeVisible();
    expect(screen.getByTestId('chat-button')).toBeVisible();
  });

  it('does not render Report Issue button in overflow menu if it was disabled', () => {
    render(<TestComponent defaultOpen />);

    expect(screen.getByTestId('screensharing-button')).toBeVisible();
    expect(screen.getByTestId('layout-button')).toBeVisible();
    expect(screen.getByTestId('archiving-button')).toBeVisible();
    expect(screen.getByTestId('captions-button')).toBeVisible();
    expect(screen.getByTestId('emoji-grid-button')).toBeVisible();
    expect(screen.queryByTestId('report-issue-button')).not.toBeInTheDocument();
    expect(screen.getByTestId('participant-list-button')).toBeVisible();
    expect(screen.getByTestId('chat-button')).toBeVisible();
  });

  describe('ScreenSharingButton', () => {
    it('is not rendered for mobile devices', () => {
      (util.isMobile as Mock).mockImplementation(() => true);
      render(<TestComponent defaultOpen />);

      expect(screen.queryByTestId('screensharing-button')).not.toBeInTheDocument();
    });

    it('is rendered for desktop devices', () => {
      render(<TestComponent defaultOpen />);

      expect(screen.getByTestId('screensharing-button')).toBeVisible();
    });
  });
});
