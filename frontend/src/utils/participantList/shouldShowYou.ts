type NameMatcher = (name: string) => boolean;

const shouldShowYou = (nameMatches: NameMatcher | undefined, youName: string): boolean => {
  if (!nameMatches) return true;
  return nameMatches(youName);
};

export default shouldShowYou;
