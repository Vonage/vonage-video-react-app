/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import debounce from './';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay callback execution', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 500);

    debounced();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer on subsequent calls', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 500);

    debounced();
    vi.advanceTimersByTime(300);

    // Second call should reset the timer
    debounced();
    vi.advanceTimersByTime(300);

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should only call callback once after multiple rapid calls', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 500);

    debounced();
    debounced();
    debounced();
    debounced();

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the callback', () => {
    const callback = vi.fn((a: number, b: string) => {});
    const debounced = debounce(callback, 500);

    debounced(42, 'test');

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledWith(42, 'test');
  });

  it('should use the latest arguments when called multiple times', () => {
    const callback = vi.fn((value: string) => {});
    const debounced = debounce(callback, 500);

    debounced('first');
    debounced('second');
    debounced('third');

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('third');
  });

  it('should handle zero delay', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 0);

    debounced();

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(0);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle multiple independent debounced functions', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const debounced1 = debounce(callback1, 500);
    const debounced2 = debounce(callback2, 300);

    debounced1();
    debounced2();

    vi.advanceTimersByTime(300);

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(200);

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should work with callbacks that have no arguments', () => {
    const callback = vi.fn(() => {});
    const debounced = debounce(callback, 500);

    debounced();

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledWith();
  });

  it('should work with callbacks that have multiple arguments', () => {
    const callback = vi.fn((a: number, b: string, c: boolean) => {});
    const debounced = debounce(callback, 500);

    debounced(1, 'test', true);

    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledWith(1, 'test', true);
  });

  it('should allow the same debounced function to be called multiple times after delay', () => {
    const callback = vi.fn();
    const debounced = debounce(callback, 500);

    debounced();
    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(1);

    debounced();
    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(2);

    debounced();
    vi.advanceTimersByTime(500);

    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('should clear previous timeout when called again', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const callback = vi.fn();
    const debounced = debounce(callback, 500);

    debounced();
    const firstCall = clearTimeoutSpy.mock.calls.length;

    debounced();

    expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(firstCall);

    clearTimeoutSpy.mockRestore();
  });

  it('should handle different delay values correctly', () => {
    const callback = vi.fn();
    const debounced100 = debounce(callback, 100);

    debounced100();

    vi.advanceTimersByTime(99);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
