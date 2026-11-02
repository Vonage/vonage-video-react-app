export type LanguagesMock = Pick<Navigator, 'language' | 'languages'>;

const languagesMock: LanguagesMock = {
  get language(): string {
    throw new Error(
      'navigator.language must be mocked explicitly in your test. ' +
        'Provide { language: "en-US" } or { languages: ["en-US"] } to makeWindowNavigatorMock(...) for your specific test.'
    );
  },
  get languages(): string[] {
    throw new Error(
      'navigator.languages must be mocked explicitly in your test. ' +
        'Provide { languages: ["en-US"] } or { language: "en-US" } to makeWindowNavigatorMock(...) for your specific test.'
    );
  },
};

export default languagesMock;
