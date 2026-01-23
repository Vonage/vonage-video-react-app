import { describe, it, expect, vi } from 'vitest';
import enqueue from './enqueue';

describe('enqueue', () => {
  it('should queue promises sequentially', async () => {
    const logger = vi.fn((msg: string) => msg);
    const afterAllCallback = vi.fn((identifier: string) => identifier);

    const first = enqueue(null, () => Promise.resolve().then(() => logger('first')));

    first.afterAll(() => afterAllCallback('first done'));

    const second = enqueue(first, () => Promise.resolve().then(() => logger('second')));

    second.afterAll(() => afterAllCallback('second done'));

    const third = enqueue(second, () => Promise.resolve().then(() => logger('third')));

    third.afterAll(() => afterAllCallback('third done'));

    const results = await third;

    expect(results).toBe('third');
    expect(logger).toHaveBeenCalledTimes(3);
    expect(logger.mock.calls[0][0]).toBe('first');
    expect(logger.mock.calls[1][0]).toBe('second');
    expect(logger.mock.calls[2][0]).toBe('third');

    expect(afterAllCallback).toHaveBeenCalledTimes(1);
    expect(afterAllCallback).toHaveBeenCalledWith('third done');
  });
});
