const isFrontFacingLabel = (label?: string): boolean => {
  if (!label) return false;
  const lower = label.toLowerCase();
  return (
    lower.includes('front') ||
    lower.includes('user') ||
    lower.includes('facetime') ||
    lower.includes('selfie')
  );
};

export default isFrontFacingLabel;
