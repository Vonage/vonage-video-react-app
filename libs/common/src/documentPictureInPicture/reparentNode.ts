export type NodeOrigin = {
  parent: Node | null;
  nextSibling: ChildNode | null;
};

/**
 * Records where a DOM node currently sits so it can be moved back later.
 * @param {Node} node - The node about to be moved
 * @returns {NodeOrigin} Parent and next sibling at capture time
 */
export const captureNodeOrigin = (node: Node): NodeOrigin => ({
  parent: node.parentNode,
  nextSibling: node.nextSibling,
});

/**
 * Moves a node under a new parent.
 * @param {Node} node - The node to move
 * @param {Node} parent - The destination parent
 */
export const moveNode = (node: Node, parent: Node): void => {
  parent.appendChild(node);
};

/**
 * Puts a node back where `captureNodeOrigin` recorded it.
 * No-ops if the original parent is gone.
 * @param {Node} node - The node to restore
 * @param {NodeOrigin} origin - Capture from `captureNodeOrigin`
 */
export const restoreNodeOrigin = (node: Node, origin: NodeOrigin): void => {
  if (!origin.parent) {
    return;
  }

  if (origin.nextSibling && origin.nextSibling.parentNode === origin.parent) {
    origin.parent.insertBefore(node, origin.nextSibling);
    return;
  }

  origin.parent.appendChild(node);
};
