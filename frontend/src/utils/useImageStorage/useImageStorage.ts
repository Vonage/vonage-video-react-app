import { useCallback, useState } from 'react';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../storage';

const MAX_LOCAL_STORAGE_BYTES = 4 * 1024 * 1024;

export type StoredImage = {
  id: string;
  dataUrl: string;
};

/**
 * Custom hook for managing image storage in localStorage.
 * @returns {object} - The image storage methods and error state.
 */
export const useImageStorage = () => {
  const [storageError, setStorageError] = useState<string>('');

  const estimateSizeInBytes = (str: string) => new Blob([str]).size;

  const getImagesFromStorage = useCallback((): StoredImage[] => {
    const stored = getStorageItem(STORAGE_KEYS.BACKGROUND_IMAGE);
    if (!stored) {
      return [];
    }
    try {
      return JSON.parse(stored) as StoredImage[];
    } catch {
      return [];
    }
  }, []);

  const saveImagesToStorage = (images: StoredImage[]): boolean => {
    try {
      const totalSize = images.reduce((acc, img) => acc + estimateSizeInBytes(img.dataUrl), 0);
      if (totalSize > MAX_LOCAL_STORAGE_BYTES) {
        setStorageError('Images are too large to store (~4MB max).');
        return false;
      }
      setStorageItem(STORAGE_KEYS.BACKGROUND_IMAGE, JSON.stringify(images));
      setStorageError('');
      return true;
    } catch {
      setStorageError('Failed to store images in localStorage.');
      return false;
    }
  };

  const addImageToStorage = (dataUrl: string): StoredImage | null => {
    const images = getImagesFromStorage();

    const isDuplicate = images.some((img) => img.dataUrl === dataUrl);
    if (isDuplicate) {
      setStorageError('This image is already added.');
      return null;
    }

    const generateId = (): string => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }

      const array = new Uint32Array(4);
      window.crypto.getRandomValues(array);
      return Array.from(array, (n) => n.toString(16)).join('');
    };

    const newImage: StoredImage = {
      id: generateId(),
      dataUrl,
    };
    images.push(newImage);
    const success = saveImagesToStorage(images);
    return success ? newImage : null;
  };

  const deleteImageFromStorage = (id: string) => {
    const images = getImagesFromStorage().filter((img) => img.id !== id);
    saveImagesToStorage(images);
  };

  const handleImageFromFile = (file: File): Promise<StoredImage | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newImage = addImageToStorage(dataUrl);
        if (newImage) {
          resolve(newImage);
        } else {
          resolve(null);
        }
      };
      reader.onerror = () => {
        setStorageError('Failed to read image file.');
        reject();
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageFromLink = (url: string): Promise<StoredImage | null> => {
    return new Promise((resolve, reject) => {
      try {
        const parsed = new URL(url);
        const validExt = /\.(jpg|jpeg|png|webp)$/i.test(parsed.pathname);
        if (!validExt) {
          setStorageError('Invalid image extension.');
          reject();
          return;
        }
      } catch {
        setStorageError('Invalid image URL.');
        reject();
        return;
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          const newImage = addImageToStorage(dataUrl);
          if (newImage) {
            resolve(newImage);
          } else {
            reject();
          }
        } catch {
          setStorageError('Could not convert image.');
          reject();
        }
      };
      img.onerror = () => {
        setStorageError('Could not load image.');
        reject();
      };
      img.src = url;
    });
  };

  return {
    storageError,
    handleImageFromFile,
    handleImageFromLink,
    getImagesFromStorage,
    deleteImageFromStorage,
    saveImagesToStorage,
  };
};
