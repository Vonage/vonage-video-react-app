/**
 * Resolves once every `<link rel="stylesheet">` in the document has loaded or failed.
 * @param {Document} target - The document whose stylesheets should be awaited
 * @returns {Promise<void>} Settles when no stylesheet is still loading
 */
const waitForStylesheets = async (target: Document): Promise<void> => {
  const pendingStylesheets = Array.from(
    target.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')
  ).filter((link) => !link.sheet);

  await Promise.all(pendingStylesheets.map(waitForStylesheet));
};

function waitForStylesheet(link: HTMLLinkElement): Promise<void> {
  return new Promise((resolve) => {
    link.addEventListener('load', () => resolve(), { once: true });
    link.addEventListener('error', () => resolve(), { once: true });
  });
}

export default waitForStylesheets;
