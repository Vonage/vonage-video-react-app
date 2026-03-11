import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupWindowNavigatorMock } from '@web-test/fixtures';

// Mock CSSStyleSheet since JSDOM doesn't support replaceSync
class MockCSSStyleSheet {
  replaceSync = vi.fn();
}

beforeEach(() => {
  vi.stubGlobal('CSSStyleSheet', MockCSSStyleSheet);
  setupWindowNavigatorMock({
    mediaDevices: {
      addEventListener: vi.fn(),
      enumerateDevices: Promise.resolve([]),
    },
    permissions: {
      query: Promise.resolve({
        state: 'granted',
      } as unknown as PermissionStatus),
    },
  });
});

describe('VeraRoomElement', () => {
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

it('does nothing when newValue is null (null-string bug guard)', async () => {
  // This is the regression case: previously a null newValue could be coerced to the
  // string "null" by String(value) in tryParseAttribute, corrupting the bridge state.
  const { default: VeraRoomElement } = await import('./VeraRoomElement');
  const element = new VeraRoomElement();
  document.body.appendChild(element);

  await element.isBridgeReady.promise;

  const partialUpdateSpy = vi.fn();
  element.context!.current.actions.partialUpdate = partialUpdateSpy;

  await element.attributeChangedCallback('session-identifier', 'old-room', null);
  expect(partialUpdateSpy).not.toHaveBeenCalled();

  element.remove();
});

it('does nothing for an unrecognised attribute name', async () => {
  const { default: VeraRoomElement } = await import('./VeraRoomElement');
  const element = new VeraRoomElement();
  document.body.appendChild(element);

  await element.isBridgeReady.promise;

  const partialUpdateSpy = vi.fn();
  element.context!.current.actions.partialUpdate = partialUpdateSpy;

  await element.attributeChangedCallback('data-unknown', null, 'some-value');
  expect(partialUpdateSpy).not.toHaveBeenCalled();

  element.remove();
});

it('calls partialUpdate with parsed value when attribute changes to a new string', async () => {
  const { default: VeraRoomElement } = await import('./VeraRoomElement');
  const element = new VeraRoomElement();
  document.body.appendChild(element);

  // Wait for isBridgeReady to resolve so context is wired up
  await element.isBridgeReady.promise;

  const partialUpdateSpy = vi.fn();
  element.context!.current.actions.partialUpdate = partialUpdateSpy;

  await element.attributeChangedCallback('session-identifier', null, 'new-room');
  expect(partialUpdateSpy).toHaveBeenCalledWith({ sessionIdentifier: 'new-room' });

  element.remove();
});

it('waits for isBridgeReady before dispatching when bridge is not yet ready', async () => {
  const { default: VeraRoomElement } = await import('./VeraRoomElement');
  // Create but do NOT append to DOM so renderReactTree / bridge never runs
  const element = new VeraRoomElement();

  // Spy by replacing isBridgeReady with a promise that we resolve manually
  const { defer } = await import('easy-cancelable-promise');
  const manualDefer = defer<void>();
  // Mark as pending before we resolve
  element.isBridgeReady = manualDefer;

  const partialUpdateSpy = vi.fn();
  // Wire up a fake context so we can observe the call
  element.context = {
    current: { actions: { partialUpdate: partialUpdateSpy }, getState: vi.fn() },
  } as never;

  const callbackPromise = element.attributeChangedCallback('language', null, 'es');

  // partialUpdate must not have been called yet (bridge not ready)
  expect(partialUpdateSpy).not.toHaveBeenCalled();

  manualDefer.resolve();
  await callbackPromise;

  expect(partialUpdateSpy).toHaveBeenCalledWith({ language: 'es' });
});
