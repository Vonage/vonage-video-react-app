// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CodeDisplay from './CodeDisplay';

vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }: { children: string }) => <pre>{children}</pre>,
}));

vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({
  oneLight: {},
}));

describe('CodeDisplay', () => {
  it('renders code with syntax highlighting', () => {
    const { container } = render(<CodeDisplay code="const value = 1;" language="javascript" />);
    expect(container.querySelector('pre')).toBeTruthy();
  });
});
