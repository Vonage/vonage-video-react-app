import { afterEach, describe, expect, it, vi } from 'vitest';
import hasWebAudioSupport from './hasWebAudioSupport';

describe('hasWebAudioSupport', () => {
  const originalAudioContext = global.AudioContext;

  afterEach(() => {
    global.AudioContext = originalAudioContext;
  });

  it('returns true when AudioContext and createStereoPanner are available', () => {
    global.AudioContext = vi.fn(() => ({})) as unknown as typeof AudioContext;
    global.AudioContext.prototype.createStereoPanner = vi.fn();

    expect(hasWebAudioSupport()).toBe(true);
  });

  it('returns false when AudioContext is not defined', () => {
    // @ts-expect-error — deliberately removing AudioContext to test absence
    delete global.AudioContext;

    expect(hasWebAudioSupport()).toBe(false);
  });

  it('returns false when createStereoPanner is not available on AudioContext prototype', () => {
    global.AudioContext = vi.fn(() => ({})) as unknown as typeof AudioContext;
    // @ts-expect-error — deliberately removing createStereoPanner
    delete global.AudioContext.prototype.createStereoPanner;

    expect(hasWebAudioSupport()).toBe(false);
  });
});
