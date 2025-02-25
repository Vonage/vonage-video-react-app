import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ChatButton from './ChatButton';

describe('ChatButton', () => {
  it('should show unread message number', () => {
    render(<ChatButton handleClick={() => {}} isOpen={false} unreadCount={10} />);
    expect(screen.getByTestId('chat-button-unread-count')).toBeVisible();
    expect(screen.getByTestId('chat-button-unread-count').textContent).toBe('10');
  });

  it('should not show unread message number when number is 0', () => {
    render(<ChatButton handleClick={() => {}} isOpen={false} unreadCount={0} />);

    const badge = within(screen.getByTestId('chat-button-unread-count')).getByText('0');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });

  it('should have a white icon when the list is closed', () => {
    render(<ChatButton handleClick={() => {}} isOpen={false} unreadCount={10} />);
    expect(screen.getByTestId('ChatIcon')).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('should have a blue icon when the chat is open', () => {
    render(<ChatButton handleClick={() => {}} isOpen unreadCount={10} />);
    expect(screen.getByTestId('ChatIcon')).toHaveStyle('color: rgb(130, 177, 255)');
  });

  it('should invoke callback on click', () => {
    const handleClick = vi.fn();
    render(<ChatButton handleClick={handleClick} isOpen unreadCount={10} />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
