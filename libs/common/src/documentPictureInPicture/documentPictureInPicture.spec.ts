import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import { isDocumentPictureInPictureSupported, useDocumentPictureInPicture } from './index';

type FakePipWindow = {
  document: Document;
  closed: boolean;
  close: ReturnType<typeof vi.fn>;
  addEventListener: ReturnType<typeof vi.fn>;
};

const makeFakePipWindow = (): FakePipWindow => ({
  document: document.implementation.createHTMLDocument(''),
  closed: false,
  close: vi.fn(),
  addEventListener: vi.fn(),
});

const stubDocumentPictureInPicture = (value: unknown) => {
  Object.defineProperty(window, 'documentPictureInPicture', {
    value,
    configurable: true,
    writable: true,
  });
};

describe('documentPictureInPicture helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    stubDocumentPictureInPicture(undefined);
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

  describe('useDocumentPictureInPicture', () => {
    it('open rejects when the Document PiP API is unavailable', async () => {
      stubDocumentPictureInPicture(undefined);
      const { result } = renderHook(() => useDocumentPictureInPicture());

      await expect(result.current.open({ width: 360, height: 260 })).rejects.toThrow(
        'Document Picture-in-Picture is not supported'
      );
    });

    it('open requests a window, applies inline styles, and creates the mount node', async () => {
      const fakePipWindow = makeFakePipWindow();
      const requestWindow = vi.fn().mockResolvedValue(fakePipWindow as unknown as Window);
      stubDocumentPictureInPicture({ requestWindow });

      const { result, rerender } = renderHook(() => useDocumentPictureInPicture());

      await act(async () => {
        await result.current.open({ width: 360, height: 260 });
      });
      rerender();

      expect(requestWindow).toHaveBeenCalledWith({ width: 360, height: 260 });
      expect(result.current.window).toBe(fakePipWindow);

      const pipBody = fakePipWindow.document.body;
      expect(pipBody.style.margin).toBe('0px');
      expect(pipBody.style.width).toBe('100%');
      expect(pipBody.style.height).toBe('100%');
      expect(fakePipWindow.document.documentElement.style.height).toBe('100%');

      const mount = fakePipWindow.document.querySelector<HTMLElement>('#mini-mode-root');
      expect(mount).not.toBeNull();
      expect(mount?.style.width).toBe('100%');
      expect(mount?.style.height).toBe('100%');
      expect(result.current.mountNode).toBe(mount);
    });

    it('close closes the PiP window and clears the exposed state', async () => {
      const fakePipWindow = makeFakePipWindow();
      stubDocumentPictureInPicture({
        requestWindow: vi.fn().mockResolvedValue(fakePipWindow as unknown as Window),
      });

      const { result, rerender } = renderHook(() => useDocumentPictureInPicture());
      await act(async () => {
        await result.current.open({ width: 360, height: 260 });
      });

      act(() => {
        result.current.close();
      });
      rerender();

      expect(fakePipWindow.close).toHaveBeenCalledOnce();
      expect(result.current.window).toBeNull();
      expect(result.current.mountNode).toBeNull();
    });

    it('closes the window when the PiP window fires pagehide', async () => {
      const fakePipWindow = makeFakePipWindow();
      stubDocumentPictureInPicture({
        requestWindow: vi.fn().mockResolvedValue(fakePipWindow as unknown as Window),
      });

      const { result } = renderHook(() => useDocumentPictureInPicture());
      await act(async () => {
        await result.current.open({ width: 360, height: 260 });
      });

      expect(fakePipWindow.addEventListener).toHaveBeenCalledWith('pagehide', expect.any(Function));

      const pagehideHandler = fakePipWindow.addEventListener.mock.calls.find(
        ([eventName]) => eventName === 'pagehide'
      )?.[1] as (() => void) | undefined;

      act(() => {
        pagehideHandler?.();
      });

      expect(fakePipWindow.close).toHaveBeenCalledOnce();
    });

    it('close is a no-op when no window is open', () => {
      const { result } = renderHook(() => useDocumentPictureInPicture());

      expect(() => result.current.close()).not.toThrow();
    });
  });
});
