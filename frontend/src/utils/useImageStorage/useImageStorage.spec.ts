import { act, renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import useImageStorage, { StoredImage } from './useImageStorage';
import { STORAGE_KEYS } from '../storage';

const mockStorage: Record<string, string> = {};

vi.mock('../storage', async () => {
  const actual = await vi.importActual<typeof import('../storage')>('../storage');
  return {
    ...actual,
    getStorageItem: vi.fn((key: string) => mockStorage[key] || null),
    setStorageItem: vi.fn((key: string, value: string) => {
      mockStorage[key] = value;
    }),
    STORAGE_KEYS: {
      BACKGROUND_IMAGE: 'BACKGROUND_IMAGE',
    },
  };
});

const mockDataUrl = 'data:image/png;base64,mockdata';
const mockImage: StoredImage = { id: '1', dataUrl: mockDataUrl };

describe('useImageStorage', () => {
  beforeEach(() => {
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it('returns empty array if no data in storage', () => {
    const { result } = renderHook(() => useImageStorage());
    expect(result.current.getImagesFromStorage()).toEqual([]);
  });

  it('returns parsed data if valid JSON in storage', () => {
    mockStorage[STORAGE_KEYS.BACKGROUND_IMAGE] = JSON.stringify([mockImage]);
    const { result } = renderHook(() => useImageStorage());
    expect(result.current.getImagesFromStorage()).toEqual([mockImage]);
  });

  it('deletes an image by id', () => {
    mockStorage[STORAGE_KEYS.BACKGROUND_IMAGE] = JSON.stringify([
      { id: '1', dataUrl: 'abc' },
      { id: '2', dataUrl: 'def' },
    ]);
    const { result } = renderHook(() => useImageStorage());
    act(() => {
      result.current.deleteImageFromStorage('1');
    });

    const newData = JSON.parse(mockStorage[STORAGE_KEYS.BACKGROUND_IMAGE]);
    expect(newData).toHaveLength(1);
    expect(newData[0].id).toBe('2');
  });

  it('rejects invalid URL in handleImageFromLink', async () => {
    const { result } = renderHook(() => useImageStorage());

    await act(async () => {
      await expect(result.current.handleImageFromLink('invalid-url')).rejects.toBeUndefined();
    });

    await waitFor(() => expect(result.current.storageError).toBe('Invalid image URL.'));
  });

  it('rejects invalid extension in handleImageFromLink', async () => {
    const { result } = renderHook(() => useImageStorage());

    await act(async () => {
      await expect(
        result.current.handleImageFromLink('https://example.com/file.txt')
      ).rejects.toBeUndefined();
    });

    await waitFor(() => expect(result.current.storageError).toBe('Invalid image extension.'));
  });

  it('processes a valid file in handleImageFromFile', async () => {
    const { result } = renderHook(() => useImageStorage());
    const file = new File(['file-content'], 'test.png', { type: 'image/png' });

    await act(async () => {
      const stored = await result.current.handleImageFromFile(file);
      expect(stored?.dataUrl).toContain('data:image');
    });
  });

  it('limits image size for localStorage (~4MB)', async () => {
    const largeDataUrl = `data:image/png;base64,${'a'.repeat(5 * 1024 * 1024)}`;
    const largeImage: StoredImage = { id: 'x', dataUrl: largeDataUrl };
    const { result } = renderHook(() => useImageStorage());

    act(() => {
      const success = result.current.saveImagesToStorage([largeImage]);
      expect(success).toBe(false);
    });

    await waitFor(() =>
      expect(result.current.storageError).toBe('Images are too large to store (~4MB max).')
    );
  });
});
