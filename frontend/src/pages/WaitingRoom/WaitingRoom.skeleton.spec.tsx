import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WaitingRoomSkeleton from './WaitingRoom.skeleton';
import MemoryRouter from '@test/RouterWrapper';

describe('WaitingRoomSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <WaitingRoomSkeleton />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
