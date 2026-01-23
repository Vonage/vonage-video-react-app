import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import UsernameInputSkeleton from './UserNameInput.skeleton';

describe('UsernameInputSkeleton', () => {
  it('should render without crashing', () => {
    const { container } = render(<UsernameInputSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
