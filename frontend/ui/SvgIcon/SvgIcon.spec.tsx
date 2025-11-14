import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SvgIcon from './index';

describe('SvgIcon', () => {
  it('renders correctly', () => {
    render(
      <SvgIcon data-testid="svg-icon">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </SvgIcon>
    );

    const svgIcon = screen.getByTestId('svg-icon');
    expect(svgIcon).toBeInTheDocument();
    expect(svgIcon).toHaveClass('MuiSvgIcon-root');
    expect(svgIcon.tagName).toBe('svg');
  });

  it('renders with different colors', () => {
    const { rerender } = render(
      <SvgIcon color="primary" data-testid="colored-icon">
        <circle cx="12" cy="12" r="10" />
      </SvgIcon>
    );

    const svgIcon = screen.getByTestId('colored-icon');
    expect(svgIcon).toHaveClass('MuiSvgIcon-colorPrimary');

    rerender(
      <SvgIcon color="secondary" data-testid="colored-icon">
        <circle cx="12" cy="12" r="10" />
      </SvgIcon>
    );
    expect(svgIcon).toHaveClass('MuiSvgIcon-colorSecondary');
  });

  it('renders with different font sizes', () => {
    const { rerender } = render(
      <SvgIcon fontSize="small" data-testid="sized-icon">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </SvgIcon>
    );

    const svgIcon = screen.getByTestId('sized-icon');
    expect(svgIcon).toHaveClass('MuiSvgIcon-fontSizeSmall');

    rerender(
      <SvgIcon fontSize="large" data-testid="sized-icon">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </SvgIcon>
    );
    expect(svgIcon).toHaveClass('MuiSvgIcon-fontSizeLarge');
  });

  it('renders with viewBox prop', () => {
    render(
      <SvgIcon viewBox="0 0 32 32" data-testid="custom-viewbox">
        <circle cx="16" cy="16" r="14" />
      </SvgIcon>
    );

    const svgIcon = screen.getByTestId('custom-viewbox');
    expect(svgIcon).toHaveAttribute('viewBox', '0 0 32 32');
  });

  it('renders with custom component', () => {
    render(
      <SvgIcon component="span" data-testid="span-icon">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      </SvgIcon>
    );

    const svgIcon = screen.getByTestId('span-icon');
    expect(svgIcon.tagName).toBe('SPAN');
  });
});
