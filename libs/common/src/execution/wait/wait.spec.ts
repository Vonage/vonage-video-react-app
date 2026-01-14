import { describe, it, expect } from 'vitest';
import wait from '.';

describe('wait', () => {
  it('should wait for the specified delay', async () => {
    const start = Date.now();
    await wait(50);
    const duration = Date.now() - start;

    expect(duration).toBeGreaterThanOrEqual(45);
  });

  it('should resolve without a value', async () => {
    const result = await wait(10);

    expect(result).toBeUndefined();
  });
});
