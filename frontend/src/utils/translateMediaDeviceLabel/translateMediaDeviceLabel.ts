type TranslateMediaDeviceLabelArgs = {
  label: string;
  translate: (key: string) => string;
};

const translateMediaDeviceLabel = ({ label, translate }: TranslateMediaDeviceLabelArgs): string => {
  if (!label) {
    return label;
  }

  return label
    .replace(/^Default\b/iu, translate('devices.label.defaultPrefix'))
    .replace(/\bBuilt(?:-|\s)in\b/giu, translate('devices.label.builtIn'));
};

export default translateMediaDeviceLabel;
