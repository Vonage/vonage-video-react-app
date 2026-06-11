import { describe, it, expect } from 'vitest';
import { metricValue } from './';

describe('DefaultMetricValue', () => {
  it('formats a number with up to 2 decimal places', () => {
    expect(metricValue(1234.567, { locales: 'en-US' }).toString()).toBe('1,234.57');
  });

  it('accepts a numeric string', () => {
    expect(metricValue('42', { locales: 'en-US' }).toString()).toBe('42');
  });
});
