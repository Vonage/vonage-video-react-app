import { afterEach, describe, expect, it, vi } from 'vitest';
import { syncStylesToWindow } from './index';

describe('syncStylesToWindow', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const createDocuments = () => ({
    source: document.implementation.createHTMLDocument('source'),
    target: document.implementation.createHTMLDocument('target'),
  });

  const flushMutations = () => new Promise((resolve) => setTimeout(resolve, 0));

  it('returns a no-op cleanup when the source document has no <head>', () => {
    const { source, target } = createDocuments();
    source.documentElement.remove();

    const cleanup = syncStylesToWindow(source, target);

    expect(typeof cleanup).toBe('function');
    expect(target.head.querySelectorAll('link, style')).toHaveLength(0);
    cleanup();
  });

  it('mirrors a <link rel="stylesheet"> added to the source head', async () => {
    const { source, target } = createDocuments();
    const cleanup = syncStylesToWindow(source, target);

    const link = source.createElement('link');
    link.rel = 'stylesheet';
    Object.defineProperty(link, 'href', {
      get: () => 'https://example.com/style.css',
      configurable: true,
    });
    source.head.appendChild(link);

    await flushMutations();

    const cloned = target.head.querySelector('link[href="https://example.com/style.css"]');
    expect(cloned).toBeTruthy();
    expect(cloned?.getAttribute('rel')).toBe('stylesheet');
    cleanup();
  });

  it('ignores links that are not stylesheets and non-style elements', async () => {
    const { source, target } = createDocuments();
    const cleanup = syncStylesToWindow(source, target);

    const link = source.createElement('link');
    link.rel = 'icon';
    source.head.appendChild(link);
    source.head.appendChild(source.createElement('div'));
    const textNode = source.createTextNode('plain text');
    source.head.appendChild(textNode);
    source.head.removeChild(textNode);

    await flushMutations();

    expect(target.head.querySelectorAll('link, style')).toHaveLength(0);
    cleanup();
  });

  it('does not mirror a stylesheet link whose resolved href is empty', async () => {
    const { source, target } = createDocuments();
    const cleanup = syncStylesToWindow(source, target);

    const link = source.createElement('link');
    link.rel = 'stylesheet';
    Object.defineProperty(link, 'href', {
      get: () => '',
      configurable: true,
    });
    source.head.appendChild(link);

    await flushMutations();

    expect(target.head.querySelector('link')).toBeNull();
    cleanup();
  });

  it('mirrors a <style> element added to the source head', async () => {
    const { source, target } = createDocuments();
    const cleanup = syncStylesToWindow(source, target);

    const style = source.createElement('style');
    style.textContent = '.foo { color: red; }';
    source.head.appendChild(style);

    await flushMutations();

    const cloned = target.head.querySelector('style');
    expect(cloned?.textContent).toBe('.foo { color: red; }');
    cleanup();
  });

  it('removes the mirrored <link> from the target when removed from the source', async () => {
    const { source, target } = createDocuments();
    const cleanup = syncStylesToWindow(source, target);

    const link = source.createElement('link');
    link.rel = 'stylesheet';
    Object.defineProperty(link, 'href', {
      get: () => 'https://example.com/style.css',
      configurable: true,
    });
    source.head.appendChild(link);
    await flushMutations();

    source.head.removeChild(link);
    await flushMutations();

    expect(target.head.querySelector('link')).toBeNull();
    cleanup();
  });

  it('removes the mirrored <style> from the target when removed from the source', async () => {
    const { source, target } = createDocuments();
    const cleanup = syncStylesToWindow(source, target);

    const style = source.createElement('style');
    style.textContent = '.foo { color: blue; }';
    source.head.appendChild(style);
    await flushMutations();

    source.head.removeChild(style);
    await flushMutations();

    expect(target.head.querySelector('style')).toBeNull();
    cleanup();
  });

  it('does not remove non-style nodes from the target', async () => {
    const { source, target } = createDocuments();
    const cleanup = syncStylesToWindow(source, target);

    const meta = source.createElement('meta');
    source.head.appendChild(meta);
    await flushMutations();
    source.head.removeChild(meta);
    await flushMutations();

    expect(target.head.querySelectorAll('link, style')).toHaveLength(0);
    cleanup();
  });

  it('disconnects the observer when the cleanup function is called', async () => {
    const { source, target } = createDocuments();
    const cleanup = syncStylesToWindow(source, target);

    cleanup();

    const style = source.createElement('style');
    style.textContent = '.bar { color: green; }';
    source.head.appendChild(style);
    await flushMutations();

    expect(target.head.querySelector('style')).toBeNull();
  });
});
