import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionContextType } from '../../../Context/SessionProvider/session';
import useSessionContext from '../../../hooks/useSessionContext';
import ChatInput from './ChatInput';
import { ChatMessageType } from '../../../types/chat';

vi.mock('../../../hooks/useSessionContext.tsx');
vi.mock('../../../hooks/useUserContext');
const mockUseSessionContext = useSessionContext as Mock<[], SessionContextType>;

const testMessages: ChatMessageType[] = [
  {
    participantName: 'User One',
    timestamp: 1726587657728,
    message: 'Hello all',
  },
];

describe('ChatInput', () => {
  let sessionContext: SessionContextType;
  const sendChatMessageMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionContext = {
      messages: testMessages,
      sendChatMessage: sendChatMessageMock,
    } as unknown as SessionContextType;
    mockUseSessionContext.mockReturnValue(sessionContext as unknown as SessionContextType);
  });

  it('renders the chat input field', () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Send a message');
    expect(input).toBeInTheDocument();
  });

  it('does not send a message when composing', () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Send a message');

    fireEvent.compositionStart(input);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(sendChatMessageMock).not.toHaveBeenCalled();

    fireEvent.compositionEnd(input);
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    expect(sendChatMessageMock).not.toHaveBeenCalled();
  });

  it('sends a message on Enter when not composing', () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Send a message');

    fireEvent.change(input, { target: { value: testMessages[0].message } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    expect(sendChatMessageMock).toHaveBeenCalledWith(testMessages[0].message);
  });

  it('does not send a message on Enter if Shift is pressed', () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Send a message');

    fireEvent.change(input, { target: { value: testMessages[0].message } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });

    expect(sendChatMessageMock).not.toHaveBeenCalled();
  });

  it('trims whitespace before sending a message', () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Send a message');

    fireEvent.change(input, { target: { value: `   ${testMessages[0].message}   ` } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });

    expect(sendChatMessageMock).toHaveBeenCalledWith(`${testMessages[0].message}`);
  });

  it('does not send an empty message', () => {
    render(<ChatInput />);
    const input = screen.getByPlaceholderText('Send a message');
    const sendButton = screen.getByRole('button');

    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendButton);
    expect(sendChatMessageMock).not.toHaveBeenCalled();
  });
});
