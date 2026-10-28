import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { isDocumentPictureInPictureSupported, useDocumentPictureInPicture } from './index';

describe('documentPictureInPicture', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports support only when requestWindow exists', () => {
    vi.stubGlobal('documentPictureInPicture', undefined);
    expect(isDocumentPictureInPictureSupported()).toBe(false);

    vi.stubGlobal('documentPictureInPicture', { requestWindow: vi.fn() });
    expect(isDocumentPictureInPictureSupported()).toBe(true);
  });

  it('open rejects when the API is unavailable', async () => {
    vi.stubGlobal('documentPictureInPicture', undefined);
    const { result } = renderHook(() => useDocumentPictureInPicture());

    await expect(result.current.open({ width: 360, height: 260 })).rejects.toThrow(
      'Document Picture-in-Picture is not supported'
    );
  });

  it('opens a window with a mount node and clears it on close', async () => {
    const pipWindow = stubPictureInPictureWindow();
    const { result } = renderHook(() => useDocumentPictureInPicture());

    await act(() => result.current.open({ width: 360, height: 260 }));

    expect(result.current.window).toBe(pipWindow);
    expect(result.current.mountNode?.ownerDocument).toBe(pipWindow.document);

    act(() => {
      result.current.close();
    });

    expect(pipWindow.close).toHaveBeenCalledOnce();
    expect(result.current.window).toBeNull();
    expect(result.current.mountNode).toBeNull();
  });

  it('calls the latest onClose when the browser closes the window', async () => {
    const pipWindow = stubPictureInPictureWindow();
    const firstOnClose = vi.fn();
    const latestOnClose = vi.fn();
    const { result, rerender } = renderHook(
      ({ onClose }) => useDocumentPictureInPicture({ onClose }),
      { initialProps: { onClose: firstOnClose } }
    );
    rerender({ onClose: latestOnClose });

    await act(() => result.current.open({ width: 360, height: 260 }));
    act(() => {
      pipWindow.dispatchEvent(new Event('pagehide'));
    });

    expect(firstOnClose).not.toHaveBeenCalled();
    expect(latestOnClose).toHaveBeenCalledOnce();
    expect(result.current.window).toBeNull();
  });
});

function stubPictureInPictureWindow() {
  const pipWindow = Object.assign(new EventTarget(), {
    document: document.implementation.createHTMLDocument(''),
    closed: false,
    close: vi.fn(),
  });
  vi.stubGlobal('documentPictureInPicture', {
    requestWindow: vi.fn().mockResolvedValue(pipWindow),
  });
  return pipWindow;
}
