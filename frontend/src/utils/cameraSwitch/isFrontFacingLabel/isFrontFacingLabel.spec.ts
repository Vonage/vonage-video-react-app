import { describe, it, expect } from 'vitest';
import isFrontFacingLabel from '.';

describe('isFrontFacingLabel', () => {
  it('should return true for front-facing camera labels', () => {
    expect(isFrontFacingLabel('Front Camera')).toBe(true);
    expect(isFrontFacingLabel('FaceTime HD Camera')).toBe(true);
    expect(isFrontFacingLabel('User Camera')).toBe(true);
    expect(isFrontFacingLabel('Selfie Camera')).toBe(true);
  });

  it('should return false for rear-facing camera labels', () => {
    expect(isFrontFacingLabel('Rear Camera')).toBe(false);
    expect(isFrontFacingLabel('Back Camera')).toBe(false);
  });

  it('should return false for undefined or empty labels', () => {
    expect(isFrontFacingLabel(undefined)).toBe(false);
    expect(isFrontFacingLabel('')).toBe(false);
  });
});
