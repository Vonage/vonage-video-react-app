import { BACKGROUND_THUMBNAIL_MAX_DIMENSION, BACKGROUND_THUMBNAIL_QUALITY } from '../constants';

/**
 * Creates a small downscaled thumbnail from an image data URL, preserving the aspect ratio (no
 * cropping).
 *
 * Used to render lightweight previews in the background gallery instead of decoding the full-size
 * uploaded image into a ~68px tile. The full-size image is still kept for applying the background.
 *
 * This never rejects: on any failure (no canvas support such as jsdom in tests, a decode error, or
 * an encode error) it resolves with the original `dataUrl`, so uploading a custom background can
 * never be broken by thumbnail generation.
 * @param {string} dataUrl - The source image data URL.
 * @returns {Promise<string>} A downscaled JPEG thumbnail data URL, or the original on failure.
 */
const createImageThumbnail = (dataUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const context = (() => {
      try {
        return canvas.getContext('2d');
      } catch {
        return null;
      }
    })();

    // Environments without canvas support (e.g. jsdom under test) — keep the original image.
    if (!context) {
      resolve(dataUrl);
      return;
    }

    const image = new Image();

    image.onload = () => {
      try {
        const longestSide = Math.max(image.width, image.height);
        const scale =
          longestSide > BACKGROUND_THUMBNAIL_MAX_DIMENSION
            ? BACKGROUND_THUMBNAIL_MAX_DIMENSION / longestSide
            : 1;

        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', BACKGROUND_THUMBNAIL_QUALITY);
        resolve(thumbnailDataUrl.startsWith('data:image') ? thumbnailDataUrl : dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };

    image.onerror = () => resolve(dataUrl);
    image.src = dataUrl;
  });
};

export default createImageThumbnail;
