/**
 * Guards against open-redirect: only a same-origin relative path is a safe `returnTo` —
 * `//evil.com`, `/\evil.com`, and absolute URLs all resolve to another host in a browser.
 */
function isSafeReturnToPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\');
}

export default isSafeReturnToPath;
