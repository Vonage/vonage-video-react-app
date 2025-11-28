import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import VideoContainerSkeleton from './VideoContainer.skeleton';

describe('VideoContainerSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<VideoContainerSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
