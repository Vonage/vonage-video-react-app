import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import ReportIssueButton from './ReportIssueButton';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';

vi.mock('../../../hooks/useSessionContext');
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const sessionContext = {
  unreadCount: 10,
  rightPanelActiveTab: 'closed',
} as unknown as SessionContextType;

describe('ReportIssueButton', () => {
  beforeEach(() => {
    mockUseSessionContext.mockReturnValue(sessionContext);
  });

  it('should have a white icon when the form is closed', () => {
    render(<ReportIssueButton handleClick={() => {}} />);
    expect(screen.getByTestId('FeedbackIcon')).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('should have a tooltip title that indicates that chat can be opened', async () => {
    render(<ReportIssueButton handleClick={() => {}} />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Open report issue form');
  });

  describe('when issues is open', () => {
    const sessionContextPanelOpen = {
      ...sessionContext,
      rightPanelActiveTab: 'issues',
    } as unknown as SessionContextType;

    beforeEach(() => {
      mockUseSessionContext.mockReturnValue(sessionContextPanelOpen);
    });

    it('should have a blue icon when the form is open', () => {
      render(<ReportIssueButton handleClick={() => {}} />);
      expect(screen.getByTestId('FeedbackIcon')).toHaveStyle('color: rgb(130, 177, 255)');
    });

    it('should invoke callback on click', () => {
      const handleClick = vi.fn();
      render(<ReportIssueButton handleClick={handleClick} />);
      screen.getByRole('button').click();
      expect(handleClick).toHaveBeenCalled();
    });

    it('should have a tooltip title that indicates that chat can be closed', async () => {
      render(<ReportIssueButton handleClick={() => {}} />);
      const button = await screen.findByRole('button');
      await userEvent.hover(button);
      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toHaveTextContent('Close report issue form');
    });
  });
});
