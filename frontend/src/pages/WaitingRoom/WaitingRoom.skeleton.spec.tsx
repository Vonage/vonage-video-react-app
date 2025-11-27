import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WaitingRoomSkeleton from './WaitingRoom.skeleton';

describe('WaitingRoomSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<WaitingRoomSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
