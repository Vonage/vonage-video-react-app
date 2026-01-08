type NameMatcher = (candidateName: string) => boolean;

const createNameMatcher = (query: string): NameMatcher | undefined => {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) return undefined;
  return (candidateName: string) => candidateName.toLowerCase().includes(normalized);
};

export default createNameMatcher;
