import { act, renderHook } from '@testing-library/react';
import type { Subscriber } from '@vonage/client-sdk-video';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import advancedSettings$ from '@Context/AdvancedSettings';
import useCaptionsTranslation from './useCaptionsTranslation';

describe('useCaptionsTranslation', () => {
  beforeEach(() => {
    advancedSettings$.reset();
  });

  it('applies the selected language to the subscriber, including mid-session changes', () => {
    const subscriber = makeSubscriber();
    advancedSettings$.actions.setCaptionsTranslationLanguage('es-ES');

    renderHook(() => useCaptionsTranslation(subscriber));

    expect(subscriber.setCaptionsTranslationLanguage).toHaveBeenLastCalledWith('es-ES');

    act(() => {
      advancedSettings$.actions.setCaptionsTranslationLanguage(null);
    });

    expect(subscriber.setCaptionsTranslationLanguage).toHaveBeenLastCalledWith(null);
  });

  it('skips the SDK call when the subscriber already uses the selected language', () => {
    const subscriber = makeSubscriber();

    renderHook(() => useCaptionsTranslation(subscriber));

    expect(subscriber.setCaptionsTranslationLanguage).not.toHaveBeenCalled();
  });
});

function makeSubscriber(): Subscriber {
  let currentLanguage: string | null = null;

  return {
    stream: { streamId: 'stream-1' },
    getCaptionsTranslationLanguage: () => currentLanguage,
    setCaptionsTranslationLanguage: vi.fn((language: string | null) => {
      currentLanguage = language;
      return Promise.resolve();
    }),
  } as unknown as Subscriber;
}
