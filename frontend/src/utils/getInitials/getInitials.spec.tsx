import { describe, expect, it } from 'vitest';
import getInitials from './getInitials';

describe('getInitials', () => {
  it('does not throw when the name is empty', () => {
    let caughtError;
    let initials;

    const username = '';

    try {
      initials = getInitials(username);
    } catch (error) {
      caughtError = error;
    }

    expect(caughtError).toBeUndefined();
    expect(initials).toBe('');
  });
  it('returns capitalized initials for a lowercase username', () => {
    const lowercaseUsername = 'dvsn';

    const initials = getInitials(lowercaseUsername);

    expect(initials).toBe('D');
  });

  it('returns one character for one name', () => {
    const username = 'Lorde';

    const initials = getInitials(username);

    expect(initials).toBe('L');
  });

  it('returns two characters for two names', () => {
    const username = 'Julien Baker';

    const initials = getInitials(username);

    expect(initials).toBe('JB');
  });

  it("returns first and third names' first character for three names", () => {
    const username = 'Carly Rae Jepsen';

    const initials = getInitials(username);

    expect(initials).toBe('CJ');
  });

  it('returns the first name in a hyphenated last name', () => {
    const username = 'BenJarvus Green-Ellis';

    const initials = getInitials(username);

    expect(initials).toBe('BG');
  });

  it("returns first and last names' first character for n names", () => {
    const usernameArray = [
      'Daniel Michael Blake Day-Lewis',
      'Orlando Jonathan Blanchard Copeland Bloom',
      'Lionardo di ser Piero da Vinci',
      'Pablo Diego José Francisco de Paula Juan Nepomuceno Crispín Crispiniano María de los Remedios de la Santísima Trinidad Ruiz Picasso',
    ];
    const initialsArray = ['DD', 'OB', 'LV', 'PP'];

    usernameArray.forEach((username, index) => {
      const generatedInitials = getInitials(username);
      const expectedInitials = initialsArray[index];

      expect(generatedInitials).toBe(expectedInitials);
    });
  });

  it('returns initials for a single character first name', () => {
    const username = 'l';

    const initials = getInitials(username);

    expect(initials).toBe('L');
  });

  it('returns initials for a single character last name', () => {
    const username = 'Daniel Michael B';

    const initials = getInitials(username);

    expect(initials).toBe('DB');
  });

  it('returns initials for a single character first and last name', () => {
    const username = 's d';

    const initials = getInitials(username);

    expect(initials).toBe('SD');
  });

  it('handles Unicode characters with accents', () => {
    const username = 'Òscar';

    const initials = getInitials(username);

    expect(initials).toBe('Ò');
  });

  it('handles Unicode characters in multiple names', () => {
    const username = 'José María';

    const initials = getInitials(username);

    expect(initials).toBe('JM');
  });

  it('handles various accented characters', () => {
    const testCases = [
      { username: 'François Müller', expected: 'FM' },
      { username: 'Åse Björk', expected: 'ÅB' },
      { username: 'Zürich', expected: 'Z' },
      { username: 'Naïve Café', expected: 'NC' },
      { username: 'Señor López', expected: 'SL' },
    ];

    testCases.forEach(({ username, expected }) => {
      const initials = getInitials(username);
      expect(initials).toBe(expected);
    });
  });

  it('handles hyphenated names with accents', () => {
    const username = 'José-María González';

    const initials = getInitials(username);

    expect(initials).toBe('JG');
  });

  it('handles combining diacritical marks', () => {
    const username = 'André Müller';
    const initials = getInitials(username);

    expect(initials).toBe('AM');
  });

  it('handles Cyrillic characters', () => {
    const username = 'Андрій Шевченко';

    const initials = getInitials(username);

    expect(initials).toBe('АШ');
  });
});
