import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Box from './index';

describe('Box', () => {
  it('renders correctly', () => {
    render(<Box>Box content</Box>);

    const box = screen.getByText('Box content');
    expect(box).toBeInTheDocument();
  });

  it('applies custom sx props', () => {
    render(
      <Box data-testid="styled-box" sx={{ backgroundColor: 'red', padding: 2 }}>
        Styled content
      </Box>
    );

    const box = screen.getByTestId('styled-box');
    expect(box).toBeInTheDocument();
    expect(box).toHaveClass('MuiBox-root');
  });

  it('renders with different components', () => {
    render(
      <Box component="section" data-testid="section-box">
        Section content
      </Box>
    );

    const box = screen.getByTestId('section-box');
    expect(box.tagName).toBe('SECTION');
  });

  it('passes through other MUI props', () => {
    render(
      <Box p={2} m={1} bgcolor="primary.main" data-testid="props-box">
        Props content
      </Box>
    );

    const box = screen.getByTestId('props-box');
    expect(box).toBeInTheDocument();
  });
});
