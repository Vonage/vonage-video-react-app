import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Stack from './index';

describe('Stack', () => {
  it('renders correctly', () => {
    render(<Stack>Stack content</Stack>);

    const stack = screen.getByText('Stack content');
    expect(stack).toBeInTheDocument();
  });

  it('applies spacing prop', () => {
    render(
      <Stack spacing={2} data-testid="spaced-stack">
        <div>Item 1</div>
        <div>Item 2</div>
      </Stack>
    );

    const stack = screen.getByTestId('spaced-stack');
    expect(stack).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies sx prop', () => {
    render(
      <Stack data-testid="styled-stack" sx={{ backgroundColor: 'primary.main', p: 2 }}>
        Styled content
      </Stack>
    );

    const stack = screen.getByTestId('styled-stack');
    expect(stack).toBeInTheDocument();
    expect(stack).toHaveClass('MuiStack-root');
  });

  it('handles empty content', () => {
    render(<Stack data-testid="empty-stack" />);

    const stack = screen.getByTestId('empty-stack');
    expect(stack).toBeInTheDocument();
  });
});
