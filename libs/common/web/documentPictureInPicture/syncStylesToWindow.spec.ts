import { describe, expect, it } from 'vitest';
import { syncStylesToWindow } from './index';

describe('syncStylesToWindow', () => {
  it('mirrors stylesheets added to and removed from the source head, ignoring other nodes', async () => {
    const { source, target } = createDocuments();
    const stopSync = syncStylesToWindow(source, target);
    const link = createStylesheetLink(source, 'https://example.com/style.css');
    const style = source.createElement('style');
    style.textContent = '.foo { color: red; }';
    const icon = source.createElement('link');
    icon.rel = 'icon';

    source.head.append(link, style, icon, source.createElement('meta'));
    await flushMutations();

    expect(target.head.querySelector('link')?.getAttribute('href')).toBe(
      'https://example.com/style.css'
    );
    expect(target.head.querySelector('style')?.textContent).toBe('.foo { color: red; }');
    expect(mirroredStyles(target)).toHaveLength(2);

    link.remove();
    style.remove();
    await flushMutations();

    expect(mirroredStyles(target)).toHaveLength(0);
    stopSync();
  });

  it('stops mirroring once the returned cleanup is called', async () => {
    const { source, target } = createDocuments();
    syncStylesToWindow(source, target)();

    source.head.appendChild(source.createElement('style'));
    await flushMutations();

    expect(mirroredStyles(target)).toHaveLength(0);
  });
});

function createDocuments() {
  return {
    source: document.implementation.createHTMLDocument('source'),
    target: document.implementation.createHTMLDocument('target'),
  };
}

function createStylesheetLink(owner: Document, href: string): HTMLLinkElement {
  const link = owner.createElement('link');
  link.rel = 'stylesheet';
  Object.defineProperty(link, 'href', { get: () => href, configurable: true });
  return link;
}

function mirroredStyles(target: Document): NodeListOf<Element> {
  return target.head.querySelectorAll('link, style');
}

function flushMutations(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
