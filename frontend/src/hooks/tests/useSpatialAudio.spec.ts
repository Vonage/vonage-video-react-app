import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { EventEmitter } from 'events';
import { Subscriber } from '@vonage/client-sdk-video';
import { Box } from 'opentok-layout-js';
import useSpatialAudio, { calculatePan } from '../useSpatialAudio';

// ─── hasWebAudioSupport mock ─────────────────────────────────────────────────

const { mockHasWebAudioSupport } = vi.hoisted(() => ({
  mockHasWebAudioSupport: vi.fn().mockReturnValue(true),
}));

vi.mock('@utils/hasWebAudioSupport', () => ({
  default: mockHasWebAudioSupport,
}));

// ─── AudioContext mock ───────────────────────────────────────────────────────

const mockPan = { value: 0, setValueAtTime: vi.fn() };
const mockPannerNode = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  pan: mockPan,
};
const mockSourceNode = { connect: vi.fn(), disconnect: vi.fn() };
const mockAudioContextInstance = {
  createMediaStreamSource: vi.fn(() => mockSourceNode),
  createStereoPanner: vi.fn(() => mockPannerNode),
  close: vi.fn().mockResolvedValue(undefined),
  destination: {},
  currentTime: 0,
};

const MockAudioContext = vi.fn(() => mockAudioContextInstance);

// ─── MediaStream mock ─────────────────────────────────────────────────────────
// JSDOM does not implement the MediaStream constructor; the hook calls
// `new MediaStream(audioTracks)` inside activate(), so we need a stub.

const MockMediaStream = vi.fn(function (tracks: MediaStreamTrack[]) {
  return { getAudioTracks: () => tracks };
});

// ─── makeMediaStream helper ────────────────────────────────────────────────────

function makeMediaStream(trackCount = 1): MediaStream {
  const tracks = Array.from({ length: trackCount }, () => ({}) as MediaStreamTrack);
  return {
    getAudioTracks: vi.fn(() => tracks),
  } as unknown as MediaStream;
}

// ─── Subscriber mock ─────────────────────────────────────────────────────────

function makeSubscriber(volume = 80): Subscriber {
  const emitter = new EventEmitter();
  return Object.assign(emitter, {
    getAudioVolume: vi.fn(() => volume),
    setAudioVolume: vi.fn(),
  }) as unknown as Subscriber;
}

/** Cast a mocked Subscriber back to EventEmitter to allow .emit() in tests. */
const asEmitter = (sub: Subscriber): EventEmitter => sub as unknown as EventEmitter;

// ─── Box helper ──────────────────────────────────────────────────────────────

const makeBox = (left: number, width: number): Box => ({ left, width, top: 0, height: 100 }) as Box;

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('calculatePan', () => {
  it('returns 0 for a tile centred in the container', () => {
    expect(calculatePan(makeBox(0, 100), 100)).toBe(0);
  });

  it('returns -1 for a tile on the far left', () => {
    expect(calculatePan(makeBox(0, 0), 100)).toBe(-1);
  });

  it('returns +1 for a tile on the far right', () => {
    expect(calculatePan(makeBox(100, 0), 100)).toBe(1);
  });

  it('clamps values to [-1, 1]', () => {
    expect(calculatePan(makeBox(200, 0), 100)).toBe(1);
    expect(calculatePan(makeBox(-200, 0), 100)).toBe(-1);
  });

  it('returns 0 when containerWidth is 0', () => {
    expect(calculatePan(makeBox(50, 50), 0)).toBe(0);
  });

  it('returns 0 when containerWidth is negative', () => {
    expect(calculatePan(makeBox(50, 50), -10)).toBe(0);
  });

  it('calculates correct pan for a tile in the left quarter', () => {
    // tile center = 25, container = 200 → rawPan = (25/200)*2-1 = -0.75
    expect(calculatePan(makeBox(0, 50), 200)).toBeCloseTo(-0.75);
  });

  it('calculates correct pan for a tile in the right quarter', () => {
    // tile center = 175, container = 200 → rawPan = (175/200)*2-1 = 0.75
    expect(calculatePan(makeBox(150, 50), 200)).toBeCloseTo(0.75);
  });
});

describe('useSpatialAudio', () => {
  beforeEach(() => {
    global.AudioContext = MockAudioContext as unknown as typeof AudioContext;
    global.AudioContext.prototype.createStereoPanner = vi.fn();
    global.MediaStream = MockMediaStream as unknown as typeof MediaStream;
    mockHasWebAudioSupport.mockReturnValue(true);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('does nothing when subscriber is null', () => {
    renderHook(() =>
      useSpatialAudio({
        subscriber: null,
        box: makeBox(0, 50),
        containerWidth: 100,
        isEnabled: true,
      })
    );
    expect(MockAudioContext).not.toHaveBeenCalled();
  });

  it('does nothing when isEnabled is false even after stream arrives', () => {
    const subscriber = makeSubscriber();
    const mediaStream = makeMediaStream();

    renderHook(() =>
      useSpatialAudio({ subscriber, box: makeBox(0, 50), containerWidth: 100, isEnabled: false })
    );

    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream });
    });

    expect(MockAudioContext).not.toHaveBeenCalled();
  });

  it('does not activate when Web Audio is not supported (isEnabled effect is blocked)', () => {
    // When hasWebAudioSupport() returns false the isEnabled/deps effect will not
    // call activate(). The mediaStreamAvailable handler still calls activate()
    // but in a real unsupported browser new AudioContext() throws and is caught.
    // The meaningful observable side-effect is that the subscriber is never muted.
    mockHasWebAudioSupport.mockReturnValue(false);
    const subscriber = makeSubscriber();
    const mediaStream = makeMediaStream();

    // Make MockAudioContext throw (simulates an unsupported browser)
    MockAudioContext.mockImplementationOnce(() => {
      throw new Error('AudioContext not supported');
    });

    renderHook(() =>
      useSpatialAudio({ subscriber, box: makeBox(0, 50), containerWidth: 100, isEnabled: true })
    );

    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream });
    });

    // Subscriber should never be muted — activation failed silently
    expect(subscriber.setAudioVolume).not.toHaveBeenCalled();
  });

  it('activates the Web Audio pipeline when a stream arrives and isEnabled is true', () => {
    const subscriber = makeSubscriber();
    const mediaStream = makeMediaStream();

    renderHook(() =>
      useSpatialAudio({ subscriber, box: makeBox(0, 100), containerWidth: 200, isEnabled: true })
    );

    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream });
    });

    expect(MockAudioContext).toHaveBeenCalledTimes(1);
    expect(mockAudioContextInstance.createMediaStreamSource).toHaveBeenCalledTimes(1);
    expect(mockAudioContextInstance.createStereoPanner).toHaveBeenCalledTimes(1);
    expect(mockSourceNode.connect).toHaveBeenCalledWith(mockPannerNode);
    expect(mockPannerNode.connect).toHaveBeenCalledWith(mockAudioContextInstance.destination);
  });

  it('mutes the subscriber on activation', () => {
    const subscriber = makeSubscriber(75);
    const mediaStream = makeMediaStream();

    renderHook(() =>
      useSpatialAudio({ subscriber, box: makeBox(0, 100), containerWidth: 200, isEnabled: true })
    );

    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream });
    });

    expect(subscriber.setAudioVolume).toHaveBeenCalledWith(0);
  });

  it('restores the pre-mute volume on deactivation', () => {
    const subscriber = makeSubscriber(75);
    const mediaStream = makeMediaStream();

    const { rerender } = renderHook(
      ({ isEnabled }) =>
        useSpatialAudio({ subscriber, box: makeBox(0, 100), containerWidth: 200, isEnabled }),
      { initialProps: { isEnabled: true } }
    );

    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream });
    });

    expect(subscriber.setAudioVolume).toHaveBeenCalledWith(0);

    rerender({ isEnabled: false });

    expect(subscriber.setAudioVolume).toHaveBeenCalledWith(75);
  });

  it('disconnects audio nodes on deactivation', () => {
    const subscriber = makeSubscriber();
    const mediaStream = makeMediaStream();

    const { rerender } = renderHook(
      ({ isEnabled }) =>
        useSpatialAudio({ subscriber, box: makeBox(0, 100), containerWidth: 200, isEnabled }),
      { initialProps: { isEnabled: true } }
    );

    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream });
    });

    rerender({ isEnabled: false });

    expect(mockSourceNode.disconnect).toHaveBeenCalledTimes(1);
    expect(mockPannerNode.disconnect).toHaveBeenCalledTimes(1);
    expect(mockAudioContextInstance.close).toHaveBeenCalledTimes(1);
  });

  it('does not activate when the media stream has no audio tracks', () => {
    const subscriber = makeSubscriber();
    const emptyStream = makeMediaStream(0);

    renderHook(() =>
      useSpatialAudio({ subscriber, box: makeBox(0, 100), containerWidth: 200, isEnabled: true })
    );

    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream: emptyStream });
    });

    expect(MockAudioContext).not.toHaveBeenCalled();
  });

  it('does not activate when box is undefined', () => {
    const subscriber = makeSubscriber();
    const mediaStream = makeMediaStream();

    renderHook(() =>
      useSpatialAudio({ subscriber, box: undefined, containerWidth: 200, isEnabled: true })
    );

    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream });
    });

    expect(MockAudioContext).not.toHaveBeenCalled();
  });

  it('deactivates and cleans up all audio nodes on unmount', () => {
    const subscriber = makeSubscriber();
    const mediaStream = makeMediaStream();

    const { unmount } = renderHook(() =>
      useSpatialAudio({ subscriber, box: makeBox(0, 100), containerWidth: 200, isEnabled: true })
    );

    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream });
    });

    unmount();

    expect(mockSourceNode.disconnect).toHaveBeenCalled();
    expect(mockPannerNode.disconnect).toHaveBeenCalled();
    expect(mockAudioContextInstance.close).toHaveBeenCalled();
  });

  it('removes the mediaStreamAvailable listener when subscriber changes', () => {
    const subscriber1 = makeSubscriber();
    const subscriber2 = makeSubscriber();
    const offSpy = vi.spyOn(subscriber1, 'off');

    const { rerender } = renderHook(
      ({ subscriber }) =>
        useSpatialAudio({
          subscriber,
          box: makeBox(0, 100),
          containerWidth: 200,
          isEnabled: false,
        }),
      { initialProps: { subscriber: subscriber1 } }
    );

    rerender({ subscriber: subscriber2 });

    expect(offSpy).toHaveBeenCalledWith('mediaStreamAvailable', expect.any(Function));
  });

  it('updates the pan value (after debounce) when box or containerWidth changes', () => {
    const subscriber = makeSubscriber();
    const mediaStream = makeMediaStream();

    const { rerender } = renderHook(
      ({ box, containerWidth }) =>
        useSpatialAudio({ subscriber, box, containerWidth, isEnabled: true }),
      { initialProps: { box: makeBox(0, 100), containerWidth: 200 } }
    );

    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream });
    });

    // Move tile to the right and advance past the 150ms debounce
    rerender({ box: makeBox(100, 100), containerWidth: 200 });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(mockPan.setValueAtTime).toHaveBeenCalled();
  });

  it('retries activation via mediaStreamAvailable if isEnabled was true before the stream arrived', () => {
    const subscriber = makeSubscriber();
    const mediaStream = makeMediaStream();

    // isEnabled=true from the start, but stream hasn't arrived yet
    renderHook(() =>
      useSpatialAudio({ subscriber, box: makeBox(0, 100), containerWidth: 200, isEnabled: true })
    );

    // Stream arrives after the hook is already enabled
    act(() => {
      asEmitter(subscriber).emit('mediaStreamAvailable', { mediaStream });
    });

    // AudioContext should have been created exactly once
    expect(MockAudioContext).toHaveBeenCalledTimes(1);
  });
});
