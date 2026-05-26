import { render as renderBase } from '@testing-library/react';
import { createInstance } from 'i18next';
import { type ReactNode } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NotificationItem from './NotificationItem';

describe('NotificationItem', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls onDismiss after expirationMs passes', () => {
    vi.useFakeTimers();

    const onDismiss = vi.fn();

    render(
      <NotificationItem
        id={'notification:item-1'}
        type="info"
        message="message"
        expirationMs={1}
        onDismiss={onDismiss}
      />
    );

    vi.advanceTimersByTime(0);
    expect(onDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledWith('notification:item-1');
  });

  it('clears the pending timeout when unmounted', () => {
    vi.useFakeTimers();

    const onDismiss = vi.fn();
    const setTimeoutSpy = vi.spyOn(globalThis, 'setTimeout');
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

    const { unmount } = render(
      <NotificationItem
        id={'notification:item-2'}
        type="warning"
        message="message"
        expirationMs={1}
        onDismiss={onDismiss}
      />
    );

    const timeoutHandle = setTimeoutSpy.mock.results.at(-1)?.value;

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalledWith(timeoutHandle);
  });
});

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: { translation: {} } },
  interpolation: { escapeValue: false },
  initImmediate: false,
});

function render(ui: ReactNode) {
  return renderBase(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}
