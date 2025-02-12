/**
 * Util function to determine whether a mouse event e.g. a click
 * is inside the area of an element Rectangle
 * @param {MouseEvent} mouseEvent - mouse event
 * @param {DOMRect} rect - element rectangle
 * @returns {boolean} - whether event is inside rectangle
 */
const isMouseEventInsideBox = (mouseEvent: MouseEvent, rect: DOMRect) => {
  if (
    mouseEvent.x >= rect.x &&
    mouseEvent.x <= rect.x + rect.width &&
    mouseEvent.y >= rect.y &&
    mouseEvent.y <= rect.y + rect.height
  ) {
    return true;
  }
  return false;
};

export default isMouseEventInsideBox;
