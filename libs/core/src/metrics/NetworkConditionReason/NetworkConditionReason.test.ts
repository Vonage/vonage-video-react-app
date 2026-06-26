import { describe, expect, it } from 'vitest';
import { networkConditionReasonValue } from './';

describe('NetworkConditionReasonValue', () => {
  it('returns em-dash for null network condition reason', () => {
    expect(networkConditionReasonValue(null).toString()).toBe('–');
  });

  it('returns the network condition reason', () => {
    expect(networkConditionReasonValue('none').toString()).toBe('none');
    expect(networkConditionReasonValue('bandwidth').toString()).toBe('bandwidth');
    expect(networkConditionReasonValue('packetLoss').toString()).toBe('packetLoss');
  });
});
