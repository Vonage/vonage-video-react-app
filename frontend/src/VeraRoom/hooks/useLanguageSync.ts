import i18n from '../../i18n';
import bridge$ from '../stores/bridge';
import { useMountEffect } from '@web/hooks';

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
  const bridge = bridge$.use.api();

  useMountEffect(() => {
    return bridge.subscribe(
      ({ language }) => language,
      (language) => {
        void i18n.changeLanguage(language);
      }
    );
  });
};

export default useLanguageSync;
