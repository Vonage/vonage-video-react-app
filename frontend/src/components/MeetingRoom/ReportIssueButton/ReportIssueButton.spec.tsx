import { render, screen } from '@testing-library/react';
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
});
