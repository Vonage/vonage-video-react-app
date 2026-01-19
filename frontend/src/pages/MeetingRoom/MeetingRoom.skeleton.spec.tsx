import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MeetingRoomSkeleton from './MeetingRoom.skeleton';

describe('MeetingRoomSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<MeetingRoomSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
