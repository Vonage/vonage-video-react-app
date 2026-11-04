import type { ExtensionConfig } from '@api-lib/schemas/ExtensionConfig.schema';

const defaultExtensionConfig: ExtensionConfig = {
  maxTotalMinutes: 120,
  options: [20, 40, 60],
};

export default defaultExtensionConfig;
