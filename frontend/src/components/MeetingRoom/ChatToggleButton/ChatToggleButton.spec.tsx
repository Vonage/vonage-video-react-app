import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import ChatToggleButton from './ChatToggleButton';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';

vi.mock('../../../hooks/useSessionContext');
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const sessionContext = {
  unreadCount: 10,
} as unknown as SessionContextType;

describe('ChatToggleButton', () => {
  beforeEach(() => {
    mockUseSessionContext.mockReturnValue(sessionContext);
  });

  it('should show unread message number', () => {
    render(<ChatToggleButton handleClick={() => {}} isOpen={false} />);
    expect(screen.getByTestId('chat-toggle-unread-count')).toBeVisible();
    expect(screen.getByTestId('chat-toggle-unread-count').textContent).toBe('10');
  });

  it('should not show unread message number when number is 0', () => {
    const sessionContextAllRead = {
      ...sessionContext,
      unreadCount: 0,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContextAllRead);
    render(<ChatToggleButton handleClick={() => {}} isOpen={false} />);

    const badge = screen.getByTestId('chat-toggle-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });

  it('should have a white icon when the list is closed', () => {
    render(<ChatToggleButton handleClick={() => {}} isOpen={false} />);
    expect(screen.getByTestId('ChatIcon')).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('should have a blue icon when the chat is open', () => {
    render(<ChatToggleButton handleClick={() => {}} isOpen />);
    expect(screen.getByTestId('ChatIcon')).toHaveStyle('color: rgb(130, 177, 255)');
  });

  it('should invoke callback on click', () => {
    const handleClick = vi.fn();
    render(<ChatToggleButton handleClick={handleClick} isOpen />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
