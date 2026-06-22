import { describe, it, expect } from 'vitest';
import { packetLossValue } from './';

const locale = { locales: 'en-US' };

describe('PacketLossValue', () => {
  it('formats ratio as percentage with 2 decimal places', () => {
    expect(packetLossValue(0.1234, locale).toString()).toBe('12.34%');
    expect(packetLossValue(0, locale).toString()).toBe('0.00%');
  });
});
