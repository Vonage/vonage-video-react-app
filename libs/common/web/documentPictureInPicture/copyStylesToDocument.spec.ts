import { describe, expect, it } from 'vitest';
import { copyStylesToDocument } from './index';

const createDocuments = () => ({
  source: document.implementation.createHTMLDocument('source'),
  target: document.implementation.createHTMLDocument('target'),
});

describe('copyStylesToDocument', () => {
  it('copies root class names, <style> elements, and stylesheet links', () => {
    const { source, target } = createDocuments();
    source.documentElement.className = 'theme-dark';
    source.body.className = 'app';

    const style = source.createElement('style');
    style.textContent = '.x { color: red; }';
    source.head.appendChild(style);

    const link = source.createElement('link');
    link.rel = 'stylesheet';
    link.setAttribute('href', '/a.css');
    // createHTMLDocument does not resolve href against a base URI, so simulate
    // the absolute URL the browser would expose on an element in the main document
    Object.defineProperty(link, 'href', {
      get: () => 'https://example.com/a.css',
      configurable: true,
    });
    source.head.appendChild(link);

    copyStylesToDocument(source, target);

    expect(target.documentElement.className).toBe('theme-dark');
    expect(target.body.className).toBe('app');
    expect(target.head.querySelector('style')?.textContent).toBe('.x { color: red; }');

    const clonedLink = target.head.querySelector('link');
    expect(clonedLink?.getAttribute('rel')).toBe('stylesheet');
    expect(clonedLink?.getAttribute('href')).toBe('https://example.com/a.css');
  });

  it('skips stylesheet links whose resolved href is empty', () => {
    const { source, target } = createDocuments();

    const link = source.createElement('link');
    link.rel = 'stylesheet';
    Object.defineProperty(link, 'href', {
      get: () => '',
      configurable: true,
    });
    source.head.appendChild(link);

    copyStylesToDocument(source, target);

    expect(target.head.querySelector('link')).toBeNull();
  });

  it('ignores links that are not stylesheets', () => {
    const { source, target } = createDocuments();

    const link = source.createElement('link');
    link.rel = 'icon';
    link.setAttribute('href', '/favicon.ico');
    source.head.appendChild(link);

    copyStylesToDocument(source, target);

    expect(target.head.querySelector('link')).toBeNull();
  });
});
