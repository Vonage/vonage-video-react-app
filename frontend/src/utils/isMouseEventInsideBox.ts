import { MouseEvent } from 'react';

/**
 * Util function to determine whether a mouse event e.g. a click
 * is inside the area of an element Rectangle
 * @param {MouseEvent} mouseEvent - mouse event
 * @param {DOMRect} rect - element rectangle
 * @returns {boolean} - whether event is inside rectangle
 */
const isMouseEventInsideBox = (mouseEvent: MouseEvent<HTMLElement>, rect: DOMRect) => {
  if (
    mouseEvent.clientX >= rect.x &&
    mouseEvent.clientX <= rect.x + rect.width &&
    mouseEvent.clientY >= rect.y &&
    mouseEvent.clientY <= rect.y + rect.height
  ) {
    return true;
  }
  return false;
};

export default isMouseEventInsideBox;
