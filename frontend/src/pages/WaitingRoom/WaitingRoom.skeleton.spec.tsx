import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WaitingRoomSkeleton from './WaitingRoom.skeleton';
import { MemoryRouter } from 'react-router-dom';

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
