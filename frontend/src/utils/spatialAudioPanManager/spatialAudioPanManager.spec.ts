import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  registerPanner,
  updatePannerLayout,
  unregisterPanner,
  getRegisteredPannerCount,
  resetPanManager,
} from './spatialAudioPanManager';

function makePanner(): StereoPannerNode {
  return {
    pan: { setValueAtTime: vi.fn(), value: 0 },
    connect: vi.fn(),
    disconnect: vi.fn(),
  } as unknown as StereoPannerNode;
}

function makeAudioContext(): AudioContext {
  return { currentTime: 0.5 } as unknown as AudioContext;
}

const box = { left: 100, top: 0, width: 200, height: 150 };
const containerWidth = 1000;

describe('spatialAudioPanManager', () => {
  let rafCallbacks: FrameRequestCallback[];

  function flushRaf() {
    const cbs = [...rafCallbacks];
    rafCallbacks = [];
    cbs.forEach((cb) => cb(0));
  }

  beforeEach(() => {
    resetPanManager();
    rafCallbacks = [];
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    resetPanManager();
    vi.restoreAllMocks();
  });

  it('registers a panner and increments the count', () => {
    const panner = makePanner();
    registerPanner('sub-1', panner, makeAudioContext(), box, containerWidth);
    expect(getRegisteredPannerCount()).toBe(1);
  });

  it('updates pan on the next rAF tick after registration', () => {
    const panner = makePanner();
    registerPanner('sub-1', panner, makeAudioContext(), box, containerWidth);
    expect(panner.pan.setValueAtTime).not.toHaveBeenCalled();

    flushRaf();
    expect(panner.pan.setValueAtTime).toHaveBeenCalled();
  });

  it('updates pan when layout changes', () => {
    const panner = makePanner();
    const ctx = makeAudioContext();
    registerPanner('sub-1', panner, ctx, box, containerWidth);
    flushRaf();

    (panner.pan.setValueAtTime as ReturnType<typeof vi.fn>).mockClear();

    const newBox = { left: 400, top: 0, width: 200, height: 150 };
    updatePannerLayout('sub-1', newBox, containerWidth);
    flushRaf();

    expect(panner.pan.setValueAtTime).toHaveBeenCalled();
  });

  it('does not update pan for a non-existent panner', () => {
    updatePannerLayout('nonexistent', box, containerWidth);
    expect(getRegisteredPannerCount()).toBe(0);
  });

  it('unregisters a panner and decrements the count', () => {
    const panner = makePanner();
    registerPanner('sub-1', panner, makeAudioContext(), box, containerWidth);
    expect(getRegisteredPannerCount()).toBe(1);

    unregisterPanner('sub-1');
    expect(getRegisteredPannerCount()).toBe(0);
  });

  it('stops the rAF loop when all panners are unregistered', () => {
    const panner = makePanner();
    registerPanner('sub-1', panner, makeAudioContext(), box, containerWidth);

    unregisterPanner('sub-1');
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('handles multiple panners independently', () => {
    const panner1 = makePanner();
    const panner2 = makePanner();
    const ctx = makeAudioContext();

    registerPanner('sub-1', panner1, ctx, { left: 0, top: 0, width: 200, height: 150 }, 1000);
    registerPanner('sub-2', panner2, ctx, { left: 800, top: 0, width: 200, height: 150 }, 1000);
    flushRaf();

    expect(getRegisteredPannerCount()).toBe(2);
    expect(panner1.pan.setValueAtTime).toHaveBeenCalled();
    expect(panner2.pan.setValueAtTime).toHaveBeenCalled();
  });

  it('resets all state', () => {
    registerPanner('sub-1', makePanner(), makeAudioContext(), box, containerWidth);
    registerPanner('sub-2', makePanner(), makeAudioContext(), box, containerWidth);

    resetPanManager();
    expect(getRegisteredPannerCount()).toBe(0);
  });
});
