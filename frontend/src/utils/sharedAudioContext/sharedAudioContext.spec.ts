import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  acquireSharedAudioContext,
  releaseSharedAudioContext,
  getSharedAudioContextRefCount,
  resetSharedAudioContext,
} from './sharedAudioContext';

const mockClose = vi.fn().mockResolvedValue(undefined);
let mockState = 'running';

const mockAudioContext = vi.fn(
  () =>
    ({
      close: mockClose,
      get state() {
        return mockState;
      },
      createMediaStreamSource: vi.fn(),
      createStereoPanner: vi.fn(),
    }) as unknown as AudioContext
);

describe('sharedAudioContext', () => {
  beforeEach(() => {
    resetSharedAudioContext();
    mockClose.mockClear();
    mockAudioContext.mockClear();
    mockState = 'running';
    global.AudioContext = mockAudioContext;
  });

  afterEach(() => {
    resetSharedAudioContext();
  });

  it('creates an AudioContext on first acquire', () => {
    const ctx = acquireSharedAudioContext();
    expect(ctx).toBeDefined();
    expect(mockAudioContext).toHaveBeenCalledTimes(1);
    expect(getSharedAudioContextRefCount()).toBe(1);
  });

  it('returns the same AudioContext on subsequent acquires', () => {
    const ctx1 = acquireSharedAudioContext();
    const ctx2 = acquireSharedAudioContext();
    expect(ctx1).toBe(ctx2);
    expect(mockAudioContext).toHaveBeenCalledTimes(1);
    expect(getSharedAudioContextRefCount()).toBe(2);
  });

  it('does not close the context when some consumers remain', () => {
    acquireSharedAudioContext();
    acquireSharedAudioContext();
    releaseSharedAudioContext();
    expect(getSharedAudioContextRefCount()).toBe(1);
    expect(mockClose).not.toHaveBeenCalled();
  });

  it('closes the context when the last consumer releases', () => {
    acquireSharedAudioContext();
    acquireSharedAudioContext();
    releaseSharedAudioContext();
    releaseSharedAudioContext();
    expect(getSharedAudioContextRefCount()).toBe(0);
    expect(mockClose).toHaveBeenCalledTimes(1);
  });

  it('creates a new context after all consumers release and re-acquire', () => {
    acquireSharedAudioContext();
    releaseSharedAudioContext();
    expect(mockAudioContext).toHaveBeenCalledTimes(1);

    mockState = 'closed';
    acquireSharedAudioContext();
    expect(mockAudioContext).toHaveBeenCalledTimes(2);
    expect(getSharedAudioContextRefCount()).toBe(1);
  });

  it('does not go below zero on extra releases', () => {
    releaseSharedAudioContext();
    releaseSharedAudioContext();
    expect(getSharedAudioContextRefCount()).toBe(0);
  });
});
