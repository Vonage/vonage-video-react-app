import { act, renderHook } from '@testing-library/react';
import type { CaptionsLanguageCode, Publisher } from '@vonage/client-sdk-video';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import advancedSettings$ from '@Context/AdvancedSettings';
import i18n from '../../../../../i18n';
import useCaptionsInputLanguage from './useCaptionsInputLanguage';

describe('useCaptionsInputLanguage', () => {
  beforeEach(async () => {
    advancedSettings$.reset();
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });

  it('applies the UI language and follows changes immediately', async () => {
    expect.assertions(2);
    await act(async () => {
      await i18n.changeLanguage('ja');
    });
    const publisher = makePublisher();

    renderHook(() => useCaptionsInputLanguage(publisher));

    expect(publisher.setCaptionsInputLanguage).toHaveBeenLastCalledWith('ja-JP');

    await act(async () => {
      await i18n.changeLanguage('de');
    });

    expect(publisher.setCaptionsInputLanguage).toHaveBeenLastCalledWith('de-DE');
  });

  it('prefers the explicit spoken language and reverts to the UI language when cleared', () => {
    const publisher = makePublisher();
    advancedSettings$.actions.setCaptionsInputLanguage('es-ES');

    renderHook(() => useCaptionsInputLanguage(publisher));

    expect(publisher.setCaptionsInputLanguage).toHaveBeenLastCalledWith('es-ES');

    act(() => {
      advancedSettings$.actions.setCaptionsInputLanguage(null);
    });

    expect(publisher.setCaptionsInputLanguage).toHaveBeenLastCalledWith('en-US');
  });

  it('skips the SDK call when the publisher already uses the target language', () => {
    advancedSettings$.actions.setCaptionsInputLanguage('ja-JP');
    const publisher = makePublisher('ja-JP');

    renderHook(() => useCaptionsInputLanguage(publisher));

    expect(publisher.setCaptionsInputLanguage).not.toHaveBeenCalled();
  });
});

function makePublisher(initialLanguage: CaptionsLanguageCode | null = null): Publisher {
  let currentLanguage = initialLanguage;

  return {
    getCaptionsInputLanguage: () => currentLanguage,
    setCaptionsInputLanguage: vi.fn((languageCode: CaptionsLanguageCode) => {
      currentLanguage = languageCode;
      return Promise.resolve();
    }),
    stream: { streamId: 'stream-id' },
  } as unknown as Publisher;
}
