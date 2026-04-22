const isSessionKeyLike = (value: string) => {
  const parts = value.split('.');
  const hasThreeParts = parts.length === 3;
  const allPartsNonEmpty = hasThreeParts && parts.every((part) => part.length > 0);
  const looksLikeBase64Url = hasThreeParts && parts.every((part) => /^[a-z0-9_-]+$/i.test(part));

  return Boolean(allPartsNonEmpty && looksLikeBase64Url);
};

export default isSessionKeyLike;
