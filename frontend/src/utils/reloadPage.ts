/**
 * Reloads the current page.
 *
 * This is the only reliable in-app recovery for a browser-blocked camera/microphone on Safari:
 * WebKit stops surfacing the getUserMedia permission prompt once a device kind has been denied
 * within a document, so no click-to-re-prompt can bring it back. A reload resets that per-document
 * permission state, letting the prompt appear again (and picking up a permission the user has since
 * re-allowed in their browser settings).
 */
const reloadPage = (): void => {
  window.location.reload();
};

export default reloadPage;
