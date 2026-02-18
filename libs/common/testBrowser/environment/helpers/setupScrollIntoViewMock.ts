import { vi } from 'vitest';

/**
 * Mock Element.scrollIntoView for jsdom environment.
 * This method is not fully implemented in jsdom.
 */
function setupScrollIntoViewMock() {
  Element.prototype.scrollIntoView = vi.fn();
}

export default setupScrollIntoViewMock;
