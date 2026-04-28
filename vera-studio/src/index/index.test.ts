import { describe, expect, it, vi } from 'vitest';

const startServerMock = vi.fn();

vi.mock('../server', () => ({
  default: startServerMock,
}));

describe('src index entrypoint', () => {
  it('starts server when imported', async () => {
    await import('../index');
    expect(startServerMock).toHaveBeenCalledTimes(1);
  });
});
