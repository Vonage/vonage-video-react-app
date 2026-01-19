import { render } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi } from 'vitest';
import MeetingRoomSkeleton from './MeetingRoom.skeleton';

describe('MeetingRoomSkeleton', () => {
  beforeAll(() => {
    vi.spyOn(globalThis.navigator.mediaDevices, 'enumerateDevices').mockResolvedValue([]);
  });

  it('should render without crashing', () => {
    const { container } = render(<MeetingRoomSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
