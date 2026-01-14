const isRearFacingLabel = (label?: string): boolean => {
  if (!label) return false;
  const lower = label.toLowerCase();
  return lower.includes('rear') || lower.includes('back') || lower.includes('environment');
};

export default isRearFacingLabel;
