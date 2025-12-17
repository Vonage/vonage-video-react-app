import { describe, it, expect } from 'vitest';
import isValidUserName from './isValidUserName';

describe('isValidUserName', () => {
  describe('valid usernames', () => {
    const validCases = [
      { input: 'John Doe', description: 'name with space' },
      { input: 'María García', description: 'name with accents' },
      { input: "O'Brien", description: 'name with apostrophe' },
      { input: 'Jean-Pierre', description: 'name with hyphen' },
      { input: 'User_123', description: 'name with underscore and numbers' },
      { input: 'John.Smith', description: 'name with period' },
      { input: 'A', description: 'single character' },
      { input: 'User', description: 'simple name' },
      { input: 'José Luis', description: 'name with special character' },
    ];

    validCases.forEach(({ input, description }) => {
      it(`should return true for ${description}: "${input}"`, () => {
        expect(isValidUserName(input)).toBe(true);
      });
    });
  });

  describe('invalid usernames', () => {
    const invalidCases = [
      { input: '', description: 'empty string' },
      { input: '   ', description: 'only whitespace' },
      { input: ' John', description: 'leading space' },
      { input: 'John ', description: 'trailing space' },
      { input: 'John  Doe', description: 'multiple consecutive spaces' },
      { input: 'John@Doe', description: 'special character @' },
      { input: 'John#Doe', description: 'special character #' },
      { input: 'John$Doe', description: 'special character $' },
      { input: 'John<script>', description: 'dangerous characters' },
      { input: 'a'.repeat(61), description: 'exceeds max length (61 chars)' },
    ];

    invalidCases.forEach(({ input, description }) => {
      it(`should return false for ${description}: "${input}"`, () => {
        expect(isValidUserName(input)).toBe(false);
      });
    });
  });

  describe('edge cases', () => {
    it('should return true for exactly 60 characters', () => {
      const sixtyChars = 'a'.repeat(60);
      expect(isValidUserName(sixtyChars)).toBe(true);
    });

    it('should return false for username that is only trimmed to valid', () => {
      expect(isValidUserName('  ValidName  ')).toBe(false);
    });
  });
});
