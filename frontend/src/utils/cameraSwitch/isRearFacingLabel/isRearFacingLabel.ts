const REAR_FACING_KEYWORDS = ['rear', 'back', 'environment'];

const isRearFacingLabel = (label?: string): boolean => {
  if (!label) return false;

  const lower = label.toLowerCase();
  return REAR_FACING_KEYWORDS.some((keyword) => lower.includes(keyword));
};

export default isRearFacingLabel;
