import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Paper from './index';

describe('Paper', () => {
  it('renders correctly', () => {
    render(<Paper>Paper content</Paper>);

    const paper = screen.getByText('Paper content');
    expect(paper).toBeInTheDocument();
    expect(paper).toHaveClass('MuiPaper-root');
  });

  it('renders with different elevations', () => {
    const { rerender } = render(
      <Paper elevation={0} data-testid="paper">
        No elevation
      </Paper>
    );

    const paper = screen.getByTestId('paper');
    expect(paper).toHaveClass('MuiPaper-elevation0');

    rerender(
      <Paper elevation={3} data-testid="paper">
        Medium elevation
      </Paper>
    );
    expect(paper).toHaveClass('MuiPaper-elevation3');

    rerender(
      <Paper elevation={8} data-testid="paper">
        High elevation
      </Paper>
    );
    expect(paper).toHaveClass('MuiPaper-elevation8');
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Paper variant="elevation" data-testid="paper">
        Elevation variant
      </Paper>
    );

    const paper = screen.getByTestId('paper');
    expect(paper).toHaveClass('MuiPaper-root');

    rerender(
      <Paper variant="outlined" data-testid="paper">
        Outlined variant
      </Paper>
    );
    expect(paper).toHaveClass('MuiPaper-outlined');
  });

  it('renders as different components', () => {
    render(
      <Paper component="section" data-testid="section-paper">
        Section Paper
      </Paper>
    );

    const paper = screen.getByTestId('section-paper');
    expect(paper.tagName).toBe('SECTION');
    expect(paper).toHaveTextContent('Section Paper');
  });

  it('renders with square corners', () => {
    render(
      <Paper square data-testid="square-paper">
        Square Paper
      </Paper>
    );

    const paper = screen.getByTestId('square-paper');
    expect(paper).toBeInTheDocument();
    // Square removes border radius styling
  });

  it('handles empty content', () => {
    render(<Paper data-testid="empty-paper" />);

    const paper = screen.getByTestId('empty-paper');
    expect(paper).toBeInTheDocument();
    expect(paper).toHaveClass('MuiPaper-root');
  });

  it('renders with nested content', () => {
    render(
      <Paper>
        <div>Header content</div>
        <div>Body content</div>
        <div>Footer content</div>
      </Paper>
    );

    expect(screen.getByText('Header content')).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });
});
