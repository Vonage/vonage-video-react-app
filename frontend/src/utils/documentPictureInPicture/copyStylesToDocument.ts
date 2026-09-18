/**
 * Copies stylesheets and root classes from one document into another.
 * Document Picture-in-Picture windows do not inherit the opener's CSS.
 * @param {Document} source - The meeting-room document
 * @param {Document} target - The Picture-in-Picture document
 */
const copyStylesToDocument = (source: Document, target: Document): void => {
  target.documentElement.className = source.documentElement.className;
  target.body.className = source.body.className;

  source.querySelectorAll('link[rel="stylesheet"], style').forEach((node) => {
    target.head.appendChild(node.cloneNode(true));
  });
};

export default copyStylesToDocument;
