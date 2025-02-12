import { describe, expect, it } from 'vitest';
import isMouseEventInsideBox from './isMouseEventInsideBox';

describe('isMouseEventInsideBox', () => {
  const testRect = {
    x: 0,
    y: 0,
    height: 20,
    width: 30,
  } as DOMRect;

  it('returns true if inside box', () => {
    const mouseEvent = new MouseEvent('click', { clientX: 4, clientY: 5 });
    const result = isMouseEventInsideBox(mouseEvent, testRect);
    expect(result).toBe(true);
  });

  it('returns true if on edge of box', () => {
    const mouseEvent = new MouseEvent('click', { clientX: 30, clientY: 20 });
    const result = isMouseEventInsideBox(mouseEvent, testRect);
    expect(result).toBe(true);
  });

  it('returns false if x outside box', () => {
    const mouseEvent = new MouseEvent('click', { clientX: 31, clientY: 5 });
    const result = isMouseEventInsideBox(mouseEvent, testRect);
    expect(result).toBe(false);
  });

  it('returns false if y outside box', () => {
    const mouseEvent = new MouseEvent('click', { clientX: 4, clientY: 21 });
    const result = isMouseEventInsideBox(mouseEvent, testRect);
    expect(result).toBe(false);
  });

  it('return false if both x and y outside box', () => {
    const mouseEvent = new MouseEvent('click', { clientX: 31, clientY: 21 });
    const result = isMouseEventInsideBox(mouseEvent, testRect);
    expect(result).toBe(false);
  });
});
