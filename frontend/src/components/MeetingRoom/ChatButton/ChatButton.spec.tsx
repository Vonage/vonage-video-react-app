import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import ChatButton from './ChatButton';
import useSessionContext from '../../../hooks/useSessionContext';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import useConfigContext from '../../../hooks/useConfigContext';
import { ConfigContextType } from '../../../Context/ConfigProvider';

vi.mock('../../../hooks/useSessionContext');
vi.mock('../../../hooks/useConfigContext');
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;
const sessionContext = {
  unreadCount: 10,
} as unknown as SessionContextType;
const mockConfigContext = {
  meetingRoomSettings: {
    allowChat: true,
  },
} as Partial<ConfigContextType> as ConfigContextType;
const mockUseConfigContext = useConfigContext as Mock<[], ConfigContextType>;

describe('ChatButton', () => {
  beforeEach(() => {
    mockUseSessionContext.mockReturnValue(sessionContext);
    mockUseConfigContext.mockReturnValue(mockConfigContext);
  });

  it('should show unread message number', () => {
    render(<ChatButton handleClick={() => {}} isOpen={false} />);
    expect(screen.getByTestId('chat-button-unread-count')).toBeVisible();
    expect(screen.getByTestId('chat-button-unread-count').textContent).toBe('10');
  });

  it('should not show unread message number when number is 0', () => {
    const sessionContextAllRead = {
      ...sessionContext,
      unreadCount: 0,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContextAllRead);
    render(<ChatButton handleClick={() => {}} isOpen={false} />);

    const badge = screen.getByTestId('chat-button-unread-count');
    // Check badge is hidden:  MUI hides badge by setting dimensions to 0x0
    expect(badge.offsetHeight).toBe(0);
    expect(badge.offsetWidth).toBe(0);
  });

  it('should have a white icon when the list is closed', () => {
    render(<ChatButton handleClick={() => {}} isOpen={false} />);
    expect(screen.getByTestId('ChatIcon')).toHaveStyle('color: rgb(255, 255, 255)');
  });

  it('should have a blue icon when the chat is open', () => {
    render(<ChatButton handleClick={() => {}} isOpen />);
    expect(screen.getByTestId('ChatIcon')).toHaveStyle('color: rgb(130, 177, 255)');
  });

  it('should invoke callback on click', () => {
    const handleClick = vi.fn();
    render(<ChatButton handleClick={handleClick} isOpen />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });

  it('is not rendered when allowChat is false', () => {
    mockUseConfigContext.mockReturnValue({
      meetingRoomSettings: {
        allowChat: false,
      },
    } as Partial<ConfigContextType> as ConfigContextType);
    render(<ChatButton handleClick={() => {}} isOpen />);
    expect(screen.queryByTestId('ChatIcon')).not.toBeInTheDocument();
  });
});
