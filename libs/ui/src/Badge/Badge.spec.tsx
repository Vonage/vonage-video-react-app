import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from './index';

describe('Badge', () => {
  it('renders correctly', () => {
    render(
      <Badge badgeContent={4} color="primary">
        <div data-testid="badge-child">Notifications</div>
      </Badge>
    );

    expect(screen.getByTestId('badge-child')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('renders with different colors', () => {
    const { rerender } = render(
      <Badge badgeContent={5} color="primary" data-testid="badge">
        <div>Primary badge</div>
      </Badge>
    );

    const badge = document.querySelector('.MuiBadge-badge');
    expect(badge).toHaveClass('MuiBadge-colorPrimary');

    rerender(
      <Badge badgeContent={5} color="secondary" data-testid="badge">
        <div>Secondary badge</div>
      </Badge>
    );

    expect(badge).toHaveClass('MuiBadge-colorSecondary');
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Badge badgeContent={3} variant="standard">
        <div>Standard badge</div>
      </Badge>
    );

    const badge = document.querySelector('.MuiBadge-badge');
    expect(badge).toHaveClass('MuiBadge-standard');

    rerender(
      <Badge badgeContent={3} variant="dot">
        <div>Dot badge</div>
      </Badge>
    );

    expect(badge).toHaveClass('MuiBadge-dot');
  });

  it('renders with different anchor origins', () => {
    render(
      <Badge badgeContent={2} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <div>Anchored badge</div>
      </Badge>
    );

    const badge = document.querySelector('.MuiBadge-badge');
    expect(badge).toHaveClass('MuiBadge-anchorOriginTopRight');
  });

  it('renders dot variant without content', () => {
    render(
      <Badge variant="dot" color="error">
        <div data-testid="dot-badge-child">Status indicator</div>
      </Badge>
    );

    expect(screen.getByTestId('dot-badge-child')).toBeInTheDocument();

    const badge = document.querySelector('.MuiBadge-badge');
    expect(badge).toHaveClass('MuiBadge-dot');
  });

  it('handles invisible prop', () => {
    render(
      <Badge badgeContent={7} invisible>
        <div>Hidden badge</div>
      </Badge>
    );

    const badge = document.querySelector('.MuiBadge-badge');
    expect(badge).toHaveClass('MuiBadge-invisible');
  });

  it('handles showZero prop', () => {
    render(
      <Badge badgeContent={0} showZero>
        <div>Zero badge</div>
      </Badge>
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('handles max prop', () => {
    render(
      <Badge badgeContent={1000} max={99}>
        <div>Max badge</div>
      </Badge>
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders with custom badge content', () => {
    render(
      <Badge badgeContent={<span>NEW</span>} color="error">
        <div>Custom content badge</div>
      </Badge>
    );

    expect(screen.getByText('NEW')).toBeInTheDocument();
  });

  it('renders with overlap', () => {
    render(
      <Badge badgeContent={5} overlap="circular">
        <div style={{ borderRadius: '50%' }}>Circular overlap</div>
      </Badge>
    );

    const badge = document.querySelector('.MuiBadge-badge');
    expect(badge).toHaveClass('MuiBadge-overlapCircular');
  });
});
