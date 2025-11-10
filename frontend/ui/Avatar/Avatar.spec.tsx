import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Avatar from './index';

describe('Avatar', () => {
  it('renders correctly with children', () => {
    render(<Avatar>AB</Avatar>);

    const avatar = screen.getByText('AB');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('MuiAvatar-root');
  });

  it('renders with image src', () => {
    render(<Avatar src="/test-avatar.jpg" alt="Test User" />);

    const avatar = screen.getByRole('img', { name: 'Test User' });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/test-avatar.jpg');
  });

  it('renders with different variants', () => {
    const { rerender } = render(
      <Avatar variant="circular" data-testid="circular-avatar">
        C
      </Avatar>
    );

    const avatar = screen.getByTestId('circular-avatar');
    expect(avatar).toHaveClass('MuiAvatar-circular');

    rerender(
      <Avatar variant="square" data-testid="square-avatar">
        S
      </Avatar>
    );
    const squareAvatar = screen.getByTestId('square-avatar');
    expect(squareAvatar).toHaveClass('MuiAvatar-square');
  });

  it('renders with icon content', () => {
    const TestIcon = () => <span>👤</span>;

    render(
      <Avatar>
        <TestIcon />
      </Avatar>
    );

    expect(screen.getByText('👤')).toBeInTheDocument();
  });
});
