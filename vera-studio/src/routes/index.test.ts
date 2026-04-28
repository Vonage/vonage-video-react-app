import { describe, expect, it } from 'vitest';
import router from './';

describe('routes index', () => {
  it('mounts health, tokens, and build routers', () => {
    const stack = (router as unknown as { stack: Array<{ regexp?: RegExp }> }).stack;
    const regexps = stack.map((layer) => String(layer.regexp));

    expect(regexps.some((value) => value.includes('\\/_'))).toBe(true);
    expect(regexps.some((value) => value.includes('\\/tokens'))).toBe(true);
    expect(regexps.some((value) => value.includes('\\/build'))).toBe(true);
  });
});
