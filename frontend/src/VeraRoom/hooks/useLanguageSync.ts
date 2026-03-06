import { useEffect } from 'react';
import i18n from '../../i18n';
import bridge$ from '../stores/bridge';

/**
 * Syncs the `language` bridge attribute to i18next whenever it changes.
 *
 * When a host page sets or updates the `language` attribute on <vera-room>,
 * the value flows into bridge$ via attributeChangedCallback. This hook
 * subscribes to that value and forwards it to i18n.changeLanguage so the
 * entire UI re-renders in the requested locale.
 *
 * An empty string means "no override" — in that case we leave i18n alone
 * so the browser-detected language (set during i18n.init) remains active.
 */
const useLanguageSync = () => {
  const language = bridge$.use.select((state) => state.language);

  useEffect(() => {
    if (!language) return;
    void i18n.changeLanguage(language);
  }, [language]);
};

export default useLanguageSync;
