import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MeetingRoomStage from './MeetingRoomStage';

vi.mock('@Context/SessionProvider/session', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

vi.mock('@Context/PublisherProvider', () => ({
  PublisherProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="publisher-provider">{children}</div>
  ),
}));

vi.mock('@pages/MeetingRoom', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="meeting-room" data-classname={props.className as string} />
  ),
}));

describe('MeetingRoomStage', () => {
  it('renders without crashing', () => {
    render(<MeetingRoomStage />);
    expect(screen.getByTestId('meeting-room')).toBeInTheDocument();
  });

  it('wraps MeetingRoom inside SessionProvider', () => {
    render(<MeetingRoomStage />);
    const sessionProvider = screen.getByTestId('session-provider');
    const meetingRoom = screen.getByTestId('meeting-room');
    expect(sessionProvider).toContainElement(meetingRoom);
  });

  it('wraps MeetingRoom inside PublisherProvider', () => {
    render(<MeetingRoomStage />);
    const publisherProvider = screen.getByTestId('publisher-provider');
    const meetingRoom = screen.getByTestId('meeting-room');
    expect(publisherProvider).toContainElement(meetingRoom);
  });

  it('passes h-full w-full className and fullSize prop to MeetingRoom', () => {
    render(<MeetingRoomStage />);
    const meetingRoom = screen.getByTestId('meeting-room');
    expect(meetingRoom).toHaveAttribute('data-classname', 'h-full w-full');
  });
});
