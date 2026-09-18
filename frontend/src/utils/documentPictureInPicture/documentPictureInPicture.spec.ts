import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  captureNodeOrigin,
  copyStylesToDocument,
  isDocumentPictureInPictureSupported,
  moveNode,
  restoreNodeOrigin,
} from './index';

describe('documentPictureInPicture helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('isDocumentPictureInPictureSupported', () => {
    it('is false when the API is missing', () => {
      vi.stubGlobal('documentPictureInPicture', undefined);
      expect(isDocumentPictureInPictureSupported()).toBe(false);
    });

    it('is true when requestWindow exists', () => {
      vi.stubGlobal('documentPictureInPicture', { requestWindow: vi.fn() });
      expect(isDocumentPictureInPictureSupported()).toBe(true);
    });
  });

  describe('moveNode', () => {
    it('moves a node and restores it to the captured origin', () => {
      const originParent = document.createElement('div');
      const destination = document.createElement('div');
      const node = document.createElement('video');
      const sibling = document.createElement('span');
      originParent.append(node, sibling);

      const origin = captureNodeOrigin(node);
      moveNode(node, destination);

      expect(node.parentNode).toBe(destination);
      expect(originParent.contains(node)).toBe(false);

      restoreNodeOrigin(node, origin);

      expect(originParent.firstChild).toBe(node);
      expect(originParent.lastChild).toBe(sibling);
    });
  });

  describe('copyStylesToDocument', () => {
    it('clones stylesheets and root classes onto the target document', () => {
      const source = document.implementation.createHTMLDocument('source');
      const target = document.implementation.createHTMLDocument('target');
      source.documentElement.className = 'theme-dark';
      source.body.className = 'app';
      const style = source.createElement('style');
      style.textContent = '.x { color: red; }';
      source.head.appendChild(style);

      copyStylesToDocument(source, target);

      expect(target.documentElement.className).toBe('theme-dark');
      expect(target.body.className).toBe('app');
      expect(target.head.querySelector('style')?.textContent).toBe('.x { color: red; }');
    });
  });
});
