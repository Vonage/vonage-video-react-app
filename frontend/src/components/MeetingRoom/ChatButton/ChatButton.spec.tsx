import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import ChatButton from './ChatButton';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';

vi.mock('../../../hooks/useSessionContext');
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const sessionContext = {
  unreadCount: 10,
  rightPanelActiveTab: 'closed',
} as unknown as SessionContextType;

describe('ChatButton', () => {
  beforeEach(() => {
    mockUseSessionContext.mockReturnValue(sessionContext);
  });

  it('should show unread message number', () => {
    render(<ChatButton handleClick={() => {}} />);
    expect(screen.getByTestId('chat-button-unread-count')).toBeVisible();
    expect(screen.getByTestId('chat-button-unread-count').textContent).toBe('10');
  });

  it('should not show unread message number when number is 0', () => {
    const sessionContextAllRead = {
      ...sessionContext,
      unreadCount: 0,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContextAllRead);
    render(<ChatButton handleClick={() => {}} />);

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });

  it('should have a white icon when the list is closed', () => {
    render(<ChatButton handleClick={() => {}} />);
    expect(screen.getByTestId('ChatIcon')).toHaveStyle('color: rgb(255, 255, 255)');
  });

  describe('when the chat is open', () => {
    const sessionContextPanelOpen = {
      ...sessionContext,
      rightPanelActiveTab: 'chat',
    } as unknown as SessionContextType;

    beforeEach(() => {
      mockUseSessionContext.mockReturnValue(sessionContextPanelOpen);
    });

    it('should have a blue icon when the chat is open', () => {
      render(<ChatButton handleClick={() => {}} />);
      expect(screen.getByTestId('ChatIcon')).toHaveStyle('color: rgb(130, 177, 255)');
    });

    it('should invoke callback on click', () => {
      const handleClick = vi.fn();
      render(<ChatButton handleClick={handleClick} />);
      screen.getByRole('button').click();
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
