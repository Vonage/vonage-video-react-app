import { useCallback, useState } from 'react';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../storage';
import { MAX_LOCAL_STORAGE_BYTES } from '../constants';

export type StoredImage = {
  id: string;
  dataUrl: string;
};

/**
 * Custom hook for managing image storage in localStorage.
 * @returns {object} - The image storage methods and error state.
 */
const useImageStorage = () => {
  const [storageError, setStorageError] = useState<string>('');

  // Estimate size of a string in bytes
  const estimateSizeInBytes = (str: string) => new Blob([str]).size;

  /**
   * Retrieves stored images from localStorage.
   * @returns {StoredImage[]} An array of stored images.
   */
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

  /**
   * Saves an array of images to localStorage.
   * @param {StoredImage[]} images - The array of images to save.
   * @returns {boolean} True if save was successful, false otherwise.
   */
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

  /**
   * Adds an image to storage.
   * @param {string} dataUrl - The data URL of the image to add.
   * @returns {StoredImage | null} The added image object, or null if duplicate or error.
   */
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

  /**
   * Reads an image file and adds it to storage as a data URL.
   * @param {File} file - The image file to store.
   * @returns {Promise<StoredImage | null>} Resolves with the stored image object, or null if duplicate or error.
   */
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

  /**
   * Loads an image from a URL, converts it to a data URL, and adds it to storage.
   * @param {string} url - The image URL to fetch and store.
   * @returns {Promise<StoredImage | null>} Resolves with the stored image object, or rejects on error.
   */
  const handleImageFromLink = (url: string): Promise<StoredImage | null> => {
    return new Promise((resolve, reject) => {
      try {
        const parsed = new URL(url);
        const validExt = /\.(jpg|jpeg|png|gif|bmp)$/i.test(parsed.pathname);
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

export default useImageStorage;
