// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ColorsTab from './ColorsTab';

describe('ColorsTab', () => {
  it('renders colors tab with color samples', () => {
    const { container } = render(<ColorsTab />);
    // Check that grid layout renders with divs
    expect(container.querySelector('[class*="grid"]')).toBeTruthy();
    expect(container.querySelector('[class*="rounded-lg"]')).toBeTruthy();
  });
});
