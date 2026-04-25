import i18n from '../../i18n';
import bridge$ from '../stores/bridge';
import { runtime$ } from '@core/stores';
import { useMountEffect } from '@web/hooks';

/**
 * Syncs the `language` bridge attribute to i18next and runtime$ whenever it changes.
 *
 * When a host page sets or updates the `language` attribute on <vera-room>,
 * the value flows into bridge$ via attributeChangedCallback. This hook
 * subscribes to that value and forwards it to i18n.changeLanguage so the
 * entire UI re-renders in the requested locale, and to runtime$ so core
 * hooks can access the current language.
 *
 * An empty string means "no override" — in that case we leave i18n alone
 * so the browser-detected language (set during i18n.init) remains active.
 */
const useLanguageSync = () => {
  const bridge = bridge$.use.api();
  const { setLanguage } = runtime$.use.actions();

  useMountEffect(() => {
    return bridge.subscribe(
      ({ language }) => language,
      (language) => {
        void i18n.changeLanguage(language);
        setLanguage(language);
      }
    );
  });
};

export default useLanguageSync;
