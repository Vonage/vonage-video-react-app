import { describe, it, expect } from 'vitest';
import createStoreApiAssertion from './createStoreApiAssertion';

describe('createStoreApiAssertion', () => {
  it('should create assertion that validates marked store APIs', () => {
    const { assertion, mark } = createStoreApiAssertion('TestStore');

    // Throws for invalid values
    expect(() => assertion(null)).toThrow();
    expect(() => assertion({})).toThrow();
    expect(() => assertion({ getMetadata: () => ({}) })).toThrow();

    // Passes for properly marked API
    const metadata = {};
    mark(metadata);
    expect(() => assertion({ getMetadata: () => metadata })).not.toThrow();
  });
});
