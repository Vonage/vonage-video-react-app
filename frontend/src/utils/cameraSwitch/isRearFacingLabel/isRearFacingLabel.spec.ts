import { describe, it, expect } from 'vitest';
import isRearFacingLabel from '.';

describe('isRearFacingLabel', () => {
  it('should return true for rear-facing camera labels', () => {
    expect(isRearFacingLabel('Rear Camera')).toBe(true);
    expect(isRearFacingLabel('Back Camera')).toBe(true);
    expect(isRearFacingLabel('Environment Camera')).toBe(true);
  });

  it('should return false for front-facing camera labels', () => {
    expect(isRearFacingLabel('Front Camera')).toBe(false);
    expect(isRearFacingLabel('FaceTime HD Camera')).toBe(false);
  });

  it('should return false for undefined or empty labels', () => {
    expect(isRearFacingLabel(undefined)).toBe(false);
    expect(isRearFacingLabel('')).toBe(false);
  });
});
