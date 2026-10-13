import { z } from 'zod';

/**
 * Enum representing supported publisher video resolutions.
 */
export enum Resolution {
  /**
   * Full HD landscape resolution
   */
  FHD_LANDSCAPE = '1920x1080',

  /**
   * Super Extended Graphics Array resolution
   */
  SXGA_LANDSCAPE = '1280x960',

  /**
   * HD landscape resolution
   */
  HD_LANDSCAPE = '1280x720',

  /**
   * VGA landscape resolution
   */
  VGA_LANDSCAPE = '640x480',

  /**
   * nHD landscape resolution
   */
  NHD_LANDSCAPE = '640x360',

  /**
   * Quarter Video Graphics Array landscape resolution
   */
  QVGA_LANDSCAPE = '320x240',

  /**
   * Low landscape resolution
   */
  LOW_LANDSCAPE = '320x180',
}

export const ResolutionSchema = z.enum(Resolution);

export default ResolutionSchema;
