type TranslateMediaDeviceLabelArgs = {
  label: string;
  translate: (key: string) => string;
};

/**
 * Translates OS-specific substrings in a media device label.
 *
 * Browsers expose device labels containing English words like "Default" and "Built-in"
 * regardless of the user's locale. This utility replaces those substrings with their
 * translated equivalents so dropdowns are fully localized.
 *
 * @param label - The device label to translate.
 * @param translate - The i18n translation function (e.g. `t` from `useTranslation`).
 * @returns The translated device label.
 */
const translateMediaDeviceLabel = ({ label, translate }: TranslateMediaDeviceLabelArgs): string => {
  if (!label) {
    return label;
  }

  return label
    .replace(/^Default\b/iu, translate('devices.label.defaultPrefix'))
    .replace(/\bBuilt(?:-|\s)in\b/giu, translate('devices.label.builtIn'));
};

export default translateMediaDeviceLabel;
