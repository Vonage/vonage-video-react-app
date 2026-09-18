/**
 * Keeps the Picture-in-Picture document's `<head>` in sync with the opener's
 * for **dynamically injected** styles — e.g. MUI/emotion runtime CSS, Vite
 * HMR updates, or code-split `<link>` tags that arrive after the initial
 * `copyStylesToDocument` call.
 *
 * The initial one-off copy only captures styles present at PiP-open time.
 * This observer catches everything added afterwards and mirrors removals too.
 *
 * @param {Document} source - The opener (meeting-room) document
 * @param {Document} target - The Picture-in-Picture document
 * @returns {() => void} Call to disconnect the observer and stop syncing
 */
const syncStylesToWindow = (source: Document, target: Document): (() => void) => {
  const head = source.head;
  if (!head) {
    return () => undefined;
  }

  const cloneNode = (node: Element) => {
    if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
      const absoluteHref = (node as HTMLLinkElement).href;
      if (!absoluteHref) {
        return;
      }
      const link = target.createElement('link');
      link.rel = 'stylesheet';
      link.href = absoluteHref;
      target.head.appendChild(link);
      return;
    }

    target.head.appendChild(node.cloneNode(true));
  };

  const observer = new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (element.matches?.('link[rel="stylesheet"], style')) {
            cloneNode(element);
          }
        }
      });

      record.removedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        const element = node as Element;
        if (!element.matches?.('link[rel="stylesheet"], style')) {
          return;
        }

        const targetNode =
          element.tagName === 'LINK'
            ? target.querySelector(`link[href="${(element as HTMLLinkElement).href}"]`)
            : Array.from(target.head.querySelectorAll('style')).find(
                (style) => style.textContent === element.textContent
              );
        targetNode?.remove();
      });
    }
  });

  observer.observe(head, { childList: true, subtree: false });

  return () => observer.disconnect();
};

export default syncStylesToWindow;
