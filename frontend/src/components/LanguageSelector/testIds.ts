export const testIds = {
  selector: 'language-selector',
  option: (languageCode: string) => `language-option-${languageCode}`,
} as const;
