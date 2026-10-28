/**
 * Copies stylesheets and root classes from one document into another.
 * Document Picture-in-Picture windows do not inherit the opener's CSS.
 *
 * Cloned `<link>` elements keep their raw `href` attribute, which resolves
 * against the target's `about:blank` URL and silently fails. We therefore
 * read the browser-resolved absolute URL via `link.href` and set it on a fresh
 * `<link>` element so the stylesheet loads correctly from the opener's origin.
 * @param {Document} source - The meeting-room document
 * @param {Document} target - The Picture-in-Picture document
 */
const copyStylesToDocument = (source: Document, target: Document): void => {
  target.documentElement.className = source.documentElement.className;
  target.body.className = source.body.className;

  const stylesheets = source.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
  stylesheets.forEach((link) => {
    const absoluteHref = link.href;
    if (!absoluteHref) {
      return;
    }

    const clonedLink = target.createElement('link');
    clonedLink.rel = 'stylesheet';
    clonedLink.href = absoluteHref;
    target.head.appendChild(clonedLink);
  });

  source.querySelectorAll('style').forEach((style) => {
    target.head.appendChild(style.cloneNode(true));
  });
};

export default copyStylesToDocument;
