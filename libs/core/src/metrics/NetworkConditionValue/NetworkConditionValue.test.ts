import { describe, expect, it } from 'vitest';
import { networkConditionValue } from './';

describe('NetworkConditionValue', () => {
  it('returns em-dash for null network condition', () => {
    expect(networkConditionValue(null).toString()).toBe('–');
  });

  it('returns the network condition', () => {
    expect(networkConditionValue('excellent').toString()).toBe('excellent');
    expect(networkConditionValue('good').toString()).toBe('good');
    expect(networkConditionValue('fair').toString()).toBe('fair');
    expect(networkConditionValue('warning').toString()).toBe('warning');
    expect(networkConditionValue('critical').toString()).toBe('critical');
    expect(networkConditionValue('unknown').toString()).toBe('unknown');
  });
});
