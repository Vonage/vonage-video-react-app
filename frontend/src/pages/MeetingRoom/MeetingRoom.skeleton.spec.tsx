import { render } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import { setupWindowNavigatorMock } from '@web-test/fixtures';
import MeetingRoomSkeleton from './MeetingRoom.skeleton';

describe('MeetingRoomSkeleton', () => {
  beforeAll(() => {
    setupWindowNavigatorMock({
      mediaDevices: {
        enumerateDevices: Promise.resolve([]),
      },
    });
  });

  it('should render without crashing', () => {
    const { container } = render(<MeetingRoomSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
