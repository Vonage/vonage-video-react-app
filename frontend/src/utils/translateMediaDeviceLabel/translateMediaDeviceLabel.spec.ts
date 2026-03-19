import { describe, expect, it } from 'vitest';
import translateMediaDeviceLabel from './translateMediaDeviceLabel';

describe('translateMediaDeviceLabel', () => {
  it('translates the default prefix and built-in suffix', () => {
    const translatedLabel = translateMediaDeviceLabel({
      label: 'Default - MacBook Pro Microphone (Built in)',
      translate: makeTranslate({
        'devices.label.builtIn': 'Integrado',
        'devices.label.defaultPrefix': 'Predeterminado',
      }),
    });

    expect(translatedLabel).toBe('Predeterminado - MacBook Pro Microphone (Integrado)');
  });

  it('translates the hyphenated built-in label variant', () => {
    const translatedLabel = translateMediaDeviceLabel({
      label: 'MacBook Pro Speakers (Built-in)',
      translate: makeTranslate({
        'devices.label.builtIn': 'Integrato',
        'devices.label.defaultPrefix': 'Predefinito',
      }),
    });

    expect(translatedLabel).toBe('MacBook Pro Speakers (Integrato)');
  });

  it('leaves unrelated labels unchanged', () => {
    const translatedLabel = translateMediaDeviceLabel({
      label: 'USB Headset Microphone',
      translate: makeTranslate({
        'devices.label.builtIn': 'Integrado',
        'devices.label.defaultPrefix': 'Predeterminado',
      }),
    });

    expect(translatedLabel).toBe('USB Headset Microphone');
  });
});

function makeTranslate(translations: Record<string, string>) {
  return (key: string): string => translations[key] ?? key;
}
