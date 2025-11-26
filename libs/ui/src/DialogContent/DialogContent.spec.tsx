import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DialogContent from './index';

describe('DialogContent', () => {
  it('renders correctly', () => {
    render(
      <DialogContent>
        <div>This is dialog content</div>
      </DialogContent>
    );

    const dialogContent = screen.getByText('This is dialog content');
    expect(dialogContent).toBeInTheDocument();

    const container = dialogContent.closest('.MuiDialogContent-root');
    expect(container).toBeInTheDocument();
  });

  it('renders with scrollable content', () => {
    render(
      <DialogContent data-testid="scrollable-content">
        <div>Line 1</div>
        <div>Line 2</div>
        <div>Line 3</div>
        <div>Long content that might need scrolling...</div>
      </DialogContent>
    );

    const dialogContent = screen.getByTestId('scrollable-content');
    expect(dialogContent).toBeInTheDocument();
    expect(dialogContent).toHaveClass('MuiDialogContent-root');

    expect(screen.getByText('Line 1')).toBeInTheDocument();
    expect(screen.getByText('Long content that might need scrolling...')).toBeInTheDocument();
  });

  it('applies custom sx props', () => {
    render(
      <DialogContent
        sx={{ padding: 4, backgroundColor: 'grey.100' }}
        data-testid="styled-dialog-content"
      >
        <p>Styled content</p>
      </DialogContent>
    );

    const dialogContent = screen.getByTestId('styled-dialog-content');
    expect(dialogContent).toBeInTheDocument();
    expect(dialogContent).toHaveClass('MuiDialogContent-root');
  });

  it('renders with dividers', () => {
    render(
      <DialogContent dividers data-testid="divided-content">
        <p>Content with dividers</p>
      </DialogContent>
    );

    const dialogContent = screen.getByTestId('divided-content');
    expect(dialogContent).toBeInTheDocument();
    expect(dialogContent).toHaveClass('MuiDialogContent-dividers');
  });

  it('renders within Dialog context', () => {
    render(
      <div role="dialog">
        <div>Dialog Title</div>
        <DialogContent>
          <p>Main dialog content goes here</p>
          <p>Additional content paragraph</p>
        </DialogContent>
        <div>Dialog Actions</div>
      </div>
    );

    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('Main dialog content goes here')).toBeInTheDocument();
    expect(screen.getByText('Additional content paragraph')).toBeInTheDocument();
    expect(screen.getByText('Dialog Actions')).toBeInTheDocument();
  });

  it('handles empty content', () => {
    render(<DialogContent data-testid="empty-dialog-content" />);

    const dialogContent = screen.getByTestId('empty-dialog-content');
    expect(dialogContent).toBeInTheDocument();
    expect(dialogContent).toHaveClass('MuiDialogContent-root');
  });
});
