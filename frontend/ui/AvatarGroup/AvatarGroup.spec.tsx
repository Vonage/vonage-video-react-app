import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AvatarGroup from './index';
import Avatar from '../Avatar';

describe('AvatarGroup', () => {
  it('renders correctly', () => {
    render(
      <AvatarGroup data-testid="avatar-group">
        <Avatar>AB</Avatar>
        <Avatar>CD</Avatar>
        <Avatar>EF</Avatar>
      </AvatarGroup>
    );

    const avatarGroup = screen.getByTestId('avatar-group');
    expect(avatarGroup).toBeInTheDocument();
    expect(avatarGroup).toHaveClass('MuiAvatarGroup-root');

    expect(screen.getByText('AB')).toBeInTheDocument();
    expect(screen.getByText('CD')).toBeInTheDocument();
    expect(screen.getByText('EF')).toBeInTheDocument();
  });

  it('renders with max prop', () => {
    render(
      <AvatarGroup max={3} data-testid="limited-avatar-group">
        <Avatar>A1</Avatar>
        <Avatar>A2</Avatar>
        <Avatar>A3</Avatar>
        <Avatar>A4</Avatar>
        <Avatar>A5</Avatar>
      </AvatarGroup>
    );

    const avatarGroup = screen.getByTestId('limited-avatar-group');
    expect(avatarGroup).toBeInTheDocument();

    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('A2')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('renders with different spacing', () => {
    render(
      <AvatarGroup spacing="small" data-testid="small-spacing-group">
        <Avatar>S1</Avatar>
        <Avatar>S2</Avatar>
      </AvatarGroup>
    );

    const avatarGroup = screen.getByTestId('small-spacing-group');
    expect(avatarGroup).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    render(
      <AvatarGroup variant="square" data-testid="square-avatar-group">
        <Avatar>SQ</Avatar>
        <Avatar>AR</Avatar>
      </AvatarGroup>
    );

    const avatarGroup = screen.getByTestId('square-avatar-group');
    expect(avatarGroup).toBeInTheDocument();
  });

  it('renders with image avatars', () => {
    render(
      <AvatarGroup>
        <Avatar src="/user1.jpg" alt="User 1" />
        <Avatar src="/user2.jpg" alt="User 2" />
        <Avatar>FB</Avatar>
      </AvatarGroup>
    );

    expect(screen.getByRole('img', { name: 'User 1' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'User 2' })).toBeInTheDocument();
    expect(screen.getByText('FB')).toBeInTheDocument();
  });

  it('renders with single avatar', () => {
    render(
      <AvatarGroup>
        <Avatar>SA</Avatar>
      </AvatarGroup>
    );

    expect(screen.getByText('SA')).toBeInTheDocument();
  });
});
