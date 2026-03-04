import { describe, it, expect, vi } from 'vitest';

// Mock CSSStyleSheet since JSDOM doesn't support replaceSync
class MockCSSStyleSheet {
  replaceSync = vi.fn();
}

describe('VeraRoomElement', () => {
  beforeEach(() => {
    vi.stubGlobal('CSSStyleSheet', MockCSSStyleSheet);
  });

  it('is registered as a custom element', async () => {
    await import('./VeraRoomElement');
    expect(customElements.get('vera-room')).toBeDefined();
  });

  it('has correct tag name', async () => {
    const { default: VeraRoomElement } = await import('./VeraRoomElement');
    expect(VeraRoomElement.tagName).toBe('vera-room');
  });

  it('creates a shadow root when appended to DOM', async () => {
    await import('./VeraRoomElement');
    const element = document.createElement('vera-room');
    document.body.appendChild(element);
    expect(element.shadowRoot).not.toBeNull();
    element.remove();
  });

  it('has mode open for shadow root', async () => {
    await import('./VeraRoomElement');
    const element = document.createElement('vera-room');
    document.body.appendChild(element);
    expect(element.shadowRoot?.mode).toBe('open');
    element.remove();
  });

  it('contains a mount div inside shadow root', async () => {
    await import('./VeraRoomElement');
    const element = document.createElement('vera-room');
    document.body.appendChild(element);
    const mountDiv = element.shadowRoot?.querySelector('.vera-room-root');
    expect(mountDiv).not.toBeNull();
    element.remove();
  });
});
