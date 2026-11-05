export type ExtensionOption = {
  minutes: number;
  isAvailable: boolean;
};

/**
 * Lists the configured extension options and whether each one still fits under the total limit.
 */
function getExtensionOptions({
  options,
  maxTotalMinutes,
  extendedMinutes,
}: {
  options: number[];
  maxTotalMinutes: number;
  extendedMinutes: number;
}): ExtensionOption[] {
  const remainingMinutes = maxTotalMinutes - extendedMinutes;

  return options.map((minutes) => ({ minutes, isAvailable: minutes <= remainingMinutes }));
}

export default getExtensionOptions;
