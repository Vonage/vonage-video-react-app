const isFirefox = () => {
  const { navigator } = globalThis as {
    navigator: Navigator & { userAgentData?: { brands: { brand: string }[] } };
  };

  if (navigator?.userAgentData?.brands) {
    return navigator?.userAgentData.brands.some((b) => b.brand.toLowerCase().includes('firefox'));
  }
  return navigator?.userAgent?.toLowerCase().includes('firefox');
};

export default isFirefox;
