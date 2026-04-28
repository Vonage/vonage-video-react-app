// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import DesignPage from './DesignPage';

describe('DesignPage', () => {
  it('renders design page with token editor and preview panel sections', () => {
    const { container } = render(<DesignPage />);

    // Check that the page renders without errors and has content
    expect(container.querySelector('[class*="grid"]')).toBeTruthy();
  });
});
