import { describe, expect, it, vi } from 'vitest';
import generateRoomName from '.';

describe('generateRoomName', () => {
  it('returns a random adjective-animal combination', () => {
    const adjectiveAnimalCombo = generateRoomName();

    expect(typeof adjectiveAnimalCombo).toBe('string');
    expect(adjectiveAnimalCombo.split('-').length).toBeGreaterThanOrEqual(2);
  });

  it('builds the name from the randomly picked adjective and animal', () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.999999)
      .mockReturnValueOnce(0.999999);

    expect(generateRoomName()).toBe('red-aardvark');
    expect(generateRoomName()).toBe('serene-zebra');
  });
});
