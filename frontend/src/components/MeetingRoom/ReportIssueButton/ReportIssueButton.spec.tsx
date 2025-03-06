import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ReportIssueButton from './ReportIssueButton';

describe('ReportIssueButton', () => {
  it('should have a white icon when the form is closed', () => {
    render(<ReportIssueButton handleClick={() => {}} isOpen={false} />);
    expect(screen.getByTestId('FeedbackIcon')).toHaveStyle('color: rgb(255, 255, 255)');
  });
  it('should have a blue icon when the form is open', () => {
    render(<ReportIssueButton handleClick={() => {}} isOpen />);
    expect(screen.getByTestId('FeedbackIcon')).toHaveStyle('color: rgb(130, 177, 255)');
  });
  it('should invoke callback on click', () => {
    const handleClick = vi.fn();
    render(<ReportIssueButton handleClick={handleClick} isOpen />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
  it('should have a tooltip title that indicates that chat can be opened', async () => {
    render(<ReportIssueButton handleClick={() => {}} isOpen={false} />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Open report issue form');
  });
  it('should have a tooltip title that indicates that chat can be closed', async () => {
    render(<ReportIssueButton handleClick={() => {}} isOpen />);
    const button = await screen.findByRole('button');
    await userEvent.hover(button);
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Close report issue form');
  });
});
