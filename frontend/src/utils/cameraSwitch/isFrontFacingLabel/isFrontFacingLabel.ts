const FRONT_FACING_KEYWORDS = ['front', 'user', 'facetime', 'selfie'];

const isFrontFacingLabel = (label?: string): boolean => {
  if (!label) return false;

  const lower = label.toLowerCase();
  return FRONT_FACING_KEYWORDS.some((keyword) => lower.includes(keyword));
};

export default isFrontFacingLabel;
