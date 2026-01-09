type NameMatcher = (candidateName: string) => boolean;

const createNameMatcher = (query: string): NameMatcher | undefined => {
  const standardize = (value: string): string => {
    return value
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const standardizedQuery = standardize(query);
  if (standardizedQuery.length === 0) return undefined;

  return (candidateName: string) => standardize(candidateName).includes(standardizedQuery);
};

export default createNameMatcher;
